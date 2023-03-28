import { z } from "zod";
import axios from "axios";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import mongodb_atlas_connection from "~/utils/mongodb";

const setup_emailjs = ({
  items,
  costs,
}: {
  items: string[];
  costs: string[];
}) => {
  const emailjs_user_id = process.env.EMAILJS_USER_ID as string;
  const emailjs_service_id = process.env.EMAILJS_SERVICE_ID as string;
  // const emailjs_template_id = process.env.EMAILJS_TEMPLATE_ID as string;
  const data = {
    service_id: emailjs_service_id,
    template_id: "Pricing_errors",
    user_id: emailjs_user_id,
    template_params: {
      items: JSON.stringify(items),
      costs: JSON.stringify(costs),
    },
  };

  return data;
};

const distributors: { [key: string]: number } = {
  "1402": 0.075, // mckesson
  "1404": 0.075, // mckesson
  "9898": 0.1, // ndc
  "1300": 0.08, // cardinal
  "1716": 0.06, // medline
  "1719": 0.06, // medline
  "2084": 0.05, // owens
  "2091": 0.05, // henryschein
  "1950": 0.03, // imco
  "2036": 0.03, // imco
  "2218": 0.03, // imco
  "2612": 0.035, // concordance
  "1070": 0.035, // concordance
  "2614": 0.035, // concordance
  "3349": 0.02, // thermofisher
};

const pricingAgreement = z.object({
  item: z.string(),
  price: z.number(),
  description: z.string().optional(),
  weight: z.number().optional(),
  pending: z.boolean(),
  material_and_labor: z.number().optional(),
  chargebacks: z.number().optional(),
  safety: z.number().optional(),
  freight_and_overhead: z.number().optional(),
  total_cost: z.number().optional(),
  profit: z.number().optional(),
  margin: z.number().optional(),
});

const contractSchema = z.object({
  contractnumber: z.string(),
  contractname: z.string(),
  contractstart: z.date(),
  contractend: z.date(),
  customers: z.array(z.string()),
  pricingagreements: z.array(pricingAgreement).optional(),
  pendingchanges: z
    .array(
      z.object({
        item: z.string(),
        price: z.number(),
        description: z.string(),
        weight: z.number().optional(),
        material_and_labor: z.number().optional(),
        chargebacks: z.number().optional(),
        freight_and_overhead: z.number().optional(),
        total_cost: z.number().optional(),
        profit: z.number().optional(),
        margin: z.number().optional(),
        previous: pricingAgreement.optional(),
      })
    )
    .optional(),
  costs: z
    .array(
      z.object({
        item: z.string(),
        alias: z.array(z.string()),
        cost: z.number(),
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        item: z.string(),
        name: z.string(),
        weight: z.number().optional(),
      })
    )
    .optional(),
  customer: z
    .object({
      contract_name: z.string(),
      distributor_fee: z.number(),
      cash_discount_fee: z.number(),
      gpo_fee: z.number(),
    })
    .optional(),
  distributor_fee: z.number().default(0.05),
  cash_discount_fee: z.number().default(0.0),
  gpo_fee: z.number().default(0.0),
  labor_and_material_safety: z.number().default(0.1),
});

export type Contract = z.infer<typeof contractSchema>;

export const contractRouter = createTRPCRouter({
  get_all_contracts: publicProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ input }) => {
      const client = await mongodb_atlas_connection();
      const db = client.db("bussepricing");
      const collection = db.collection("contract_prices");

      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);

      const contracts = (await collection
        .find(
          {
            contractstart: { $gte: date },
            $or: [
              { contractname: { $regex: input.searchTerm, $options: "i" } },
              { contractnumber: { $regex: input.searchTerm, $options: "i" } },
            ],
          },
          {
            projection: {
              _id: 0,
              contractname: 1,
              contractnumber: 1,
              contractstart: 1,
              contractend: 1,
            },
            sort: { contractend: -1 },
            limit: 10,
          }
        )
        .toArray()) as unknown as Contract[];

      return contracts;
    }),
  get_contract: publicProcedure
    .input(z.object({ contract: z.string().optional() }))
    .query(async ({ input }) => {
      if (input.contract === "undefined") {
        return null;
      }

      const client = await mongodb_atlas_connection();
      const db = client.db("bussepricing");
      const collection = db.collection("contract_prices");

      const match = {
        $match: {
          contractnumber: input.contract,
        },
      };

      const limit = {
        $limit: 1,
      };

      const costs = {
        $lookup: {
          from: "costs",
          localField: "pricingagreements.item",
          foreignField: "alias",
          as: "costs",
        },
      };

      const customer = {
        $lookup: {
          from: "customers",
          localField: "contractname",
          foreignField: "contract_name",
          as: "customer",
        },
      };

      const items = {
        $lookup: {
          from: "items",
          localField: "pricingagreements.item",
          foreignField: "alias",
          as: "items",
        },
      };

      const contract = (await collection
        .aggregate([match, limit, customer, items, costs])
        .toArray()) as unknown as Contract[];

      if (contract.length === 0) {
        return null;
      }

      const _contract = contract[0];

      if (!_contract) return null;

      const end_users: string[] = Array.from(
        new Set(
          _contract?.customers?.map((c) => {
            const customer = c.split("*")[0] as string;
            return customer;
          }) ?? []
        )
      );

      _contract.distributor_fee = _contract?.customer?.distributor_fee ?? 0.0;

      end_users.forEach((c) => {
        if (Object.keys(distributors).includes(c)) {
          _contract.distributor_fee = distributors[c] as number;
          return;
        }
      });

      _contract.cash_discount_fee =
        _contract?.customer?.cash_discount_fee ?? 0.0;
      _contract.gpo_fee = _contract?.customer?.gpo_fee ?? 0.0;
      _contract.labor_and_material_safety = 0.1;

      const _pricingagreements: Contract["pricingagreements"] = [];

      const error_missing_cost_data: Contract["pricingagreements"] = [];
      const error_missing_item_data: Contract["pricingagreements"] = [];

      console.log({ _contract });

      if (_contract?.pricingagreements?.length === _contract?.costs?.length) {
        _contract?.pricingagreements?.forEach((p, index) => {
          const material_and_labor = _contract?.costs?.[index];
          const item_data = _contract?.items?.[index];

          if (!material_and_labor || !item_data) {
            if (!material_and_labor) error_missing_cost_data.push(p);
            if (!item_data) error_missing_item_data.push(p);
            return;
          }

          // from item_data
          p.description = item_data.name;
          p.weight = item_data.weight ?? 0;

          // from material_and_labor
          p.material_and_labor = material_and_labor.cost;

          // calculated
          p.safety =
            _contract.labor_and_material_safety * material_and_labor.cost;
          p.chargebacks =
            (_contract.cash_discount_fee +
              _contract.gpo_fee +
              _contract.distributor_fee) *
            p.price;

          // freight calculation TODO: make more precise
          if (p.weight === 0) {
            p.freight_and_overhead = 1.75;
          } else if (p.weight > 0 && p.weight <= 5)
            p.freight_and_overhead = 1.0;
          else if (p.weight > 5 && p.weight <= 10) {
            p.freight_and_overhead = 1.5;
          } else if (p.weight > 10 && p.weight <= 20) {
            p.freight_and_overhead = 2.0;
          } else {
            p.freight_and_overhead = 2.5;
          }

          // calculate totals, profit and margin
          p.total_cost =
            p.material_and_labor +
            p.safety +
            p.chargebacks +
            p.freight_and_overhead;

          p.profit = p.price - p.total_cost;

          p.margin = (p.profit / p.price) * 100;

          _pricingagreements.push(p);
        });
      }

      if (
        error_missing_cost_data.length > 0 ||
        error_missing_item_data.length > 0
      ) {
        const axios_data = setup_emailjs({
          items: error_missing_item_data.map((i) => i.item),
          costs: error_missing_cost_data.map((i) => i.item),
        });
        await axios.post(
          "https://api.emailjs.com/api/v1.0/email/send",
          axios_data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const processedContract: Contract = _contract;
      processedContract.pricingagreements = _pricingagreements;

      // delete items, costs, customer
      delete processedContract.items;
      delete processedContract.costs;
      delete processedContract.customer;

      return processedContract;
    }),
});
