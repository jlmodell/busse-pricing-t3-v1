import { z } from "zod";
import axios from "axios";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import mongodb_atlas_connection from "~/utils/mongodb";
import mongodb_linode_connection from "~/utils/linode_mongodb";

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

const pricingAgreementSchema = z.object({
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
  sales_volume: z.number().optional(),
  total_sales: z.number().optional(),
  total_rebates: z.number().optional(),
  avg_price_paid: z.number().optional(),
  difference_from_set_price: z.number().optional(),
  difference_from_set_price_margin: z.number().optional(),
  total_material_labor_costs_per_unit_historical: z.number().optional(),
  total_costs_historical: z.number().optional(),
  historical_data_start: z.date().optional(),
  historical_data_end: z.date().optional(),
});

const costSchema = z.object({
  item: z.string(),
  alias: z.array(z.string()),
  cost: z.number(),
});

const itemInfoSchema = z.object({
  item: z.string(),
  name: z.string(),
  weight: z.number().optional(),
  alias: z.array(z.string()).optional(),
});

const contractSchema = z.object({
  contractnumber: z.string(),
  contractname: z.string(),
  contractstart: z.date(),
  contractend: z.date(),
  customers: z.array(z.string()),
  processed: z.boolean().optional(),
  processed_last: z.date().optional(),
  pricingagreements: z.array(pricingAgreementSchema).optional(),
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
        sales_volume: z.number().optional(),
        total_sales: z.number().optional(),
        total_rebates: z.number().optional(),
        avg_price_paid: z.number().optional(),
        difference_from_set_price: z.number().optional(),
        difference_from_set_price_margin: z.number().optional(),
        total_costs_historical: z.number().optional(),
        historical_data_start: z.date().optional(),
        historical_data_end: z.date().optional(),
        previous: pricingAgreementSchema.optional(),
      })
    )
    .optional(),
  costs: z.array(costSchema).optional(),
  items: z.array(itemInfoSchema).optional(),
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
  labor_and_material_safety: z.number().default(0.05),
  period_total_sales_volume: z.number().default(0),
  period_total_sales: z.number().default(0),
  period_total_rebates: z.number().default(0),
});

const SalesCollectionSchema = z.object({
  DATE: z.date(),
  CUST: z.string(),
  ITEM: z.string(),
  QTY: z.number(),
  SALE: z.number(),
  COST: z.number(),
  REBATECREDIT: z.number(),
});

export type Contract = z.infer<typeof contractSchema>;
export type PricingAgreement = z.infer<typeof pricingAgreementSchema>;
export type Cost = z.infer<typeof costSchema>;
export type ItemInfo = z.infer<typeof itemInfoSchema>;
export type Sale = z.infer<typeof SalesCollectionSchema>;

export const contractRouter = createTRPCRouter({
  set_processed_false: publicProcedure
    .input(z.object({ contract: z.string().min(0) }))
    .mutation(async ({ input }) => {
      const client = await mongodb_atlas_connection();
      const db = client.db("bussepricing");
      const collection = db.collection("contract_prices");

      await collection.findOneAndUpdate(
        { contractnumber: input.contract },
        { $set: { processed: false } }
      );

      return { ok: true };
    }),
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

      const sales_client = await mongodb_linode_connection();
      const sales_db = sales_client.db("busse");
      const sales_collection = sales_db.collection("sales");

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

      if (_contract.processed) {
        return _contract;
      }

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
      _contract.labor_and_material_safety = 0.05;

      const error_missing_cost_data: Contract["pricingagreements"] = [];
      const error_missing_item_data: Contract["pricingagreements"] = [];

      // setup boundaries for sales search
      const _search_start = new Date(_contract.contractstart);
      _search_start.setMonth(_search_start.getMonth() - 6);
      _search_start.setDate(1);
      const _search_end = new Date(_contract.contractend);
      _search_end.setMonth(_search_end.getMonth() - 6);

      const tempPricingagreements = await Promise.all(
        _contract?.pricingagreements?.map(async (p: PricingAgreement) => {
          const materials_and_labor =
            _contract?.costs?.filter((c) => c.alias.includes(p.item)) ?? [];

          const items_data = _contract?.items?.filter?.((i: ItemInfo) =>
            i?.alias?.includes(p.item)
          );

          const sales_data = (await sales_collection
            .find({
              ITEM: p.item,
              CUST: { $in: end_users },
              DATE: {
                $gte: _search_start, // contractstart minus 6 months
                $lte: _search_end, // contractend minus 6 months
              },
            })
            .toArray()) as unknown as Sale[];

          const sales_volume = sales_data.reduce((acc, curr) => {
            return acc + curr.QTY;
          }, 0);

          p.sales_volume = sales_volume;

          p.historical_data_start = _search_start;
          p.historical_data_end = _search_end;

          const total_sales = sales_data.reduce((acc, curr) => {
            return acc + curr.SALE;
          }, 0);

          p.total_sales = total_sales;

          const total_costs_historical = sales_data.reduce((acc, curr) => {
            return acc + curr.COST;
          }, 0);

          p.total_material_labor_costs_per_unit_historical =
            total_costs_historical / sales_volume;

          const total_rebates = sales_data.reduce((acc, curr) => {
            return acc + curr.REBATECREDIT;
          }, 0);

          p.total_rebates = total_rebates;

          p.avg_price_paid =
            sales_volume !== 0
              ? Number(total_sales) / sales_volume // (Number(total_sales) + Number(total_rebates)) / sales_volume
              : 0;

          p.difference_from_set_price = p.price - p.avg_price_paid;

          if (!materials_and_labor || !items_data) {
            if (!materials_and_labor) error_missing_cost_data.push(p);
            if (!items_data) error_missing_item_data.push(p);
            return null;
          }

          if (items_data.length < 1 || materials_and_labor.length < 1) {
            if (items_data.length < 1) error_missing_item_data.push(p);
            if (materials_and_labor.length < 1) error_missing_cost_data.push(p);
            return null;
          }

          const material_and_labor = materials_and_labor[0] ?? ({} as Cost);
          const item_data = items_data[0] ?? ({} as ItemInfo);

          // from item_data
          p.description = item_data?.name;
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

          p.total_costs_historical =
            p.total_material_labor_costs_per_unit_historical *
              (1 + _contract.labor_and_material_safety) +
            p.freight_and_overhead +
            (_contract.cash_discount_fee +
              _contract.gpo_fee +
              _contract.distributor_fee) *
              p.avg_price_paid;

          p.difference_from_set_price_margin =
            (p.avg_price_paid ?? 0) > 0
              ? ((p.avg_price_paid - p.total_costs_historical) /
                  p.avg_price_paid) *
                100
              : p.margin;

          return p;
        }) ?? []
      );

      const _pricingagreements = tempPricingagreements.filter(
        (pa: PricingAgreement | null) => pa !== null
      ) as PricingAgreement[];

      const period_total_sales_volume = _pricingagreements.reduce(
        (acc, curr) => acc + (curr?.sales_volume ?? 0),
        0
      );
      const period_total_sales = _pricingagreements.reduce(
        (acc, curr) => acc + (curr?.total_sales ?? 0),
        0
      );
      const period_total_rebates = _pricingagreements.reduce(
        (acc, curr) => acc + (curr?.total_rebates ?? 0),
        0
      );

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
      processedContract.period_total_sales_volume = period_total_sales_volume;
      processedContract.period_total_sales = period_total_sales;
      processedContract.period_total_rebates = period_total_rebates;

      // delete items, costs, customer
      delete processedContract.items;
      delete processedContract.costs;
      delete processedContract.customer;

      // sort based on margin lowest to greatest and sales volume highest to lowest
      processedContract.pricingagreements.sort(
        (a: PricingAgreement, b: PricingAgreement) => {
          if (b.sales_volume === a.sales_volume) {
            return (a?.margin ?? 0) - (b?.margin ?? 0);
          }
          return (b.sales_volume ?? 0) - (a.sales_volume ?? 0);
        }
      );

      // update database and set processed to true with processed_last to today
      await collection.updateOne(
        { contractnumber: processedContract.contractnumber },
        {
          $set: {
            processed: true,
            processed_last: new Date(),
            pricingagreements: processedContract.pricingagreements,
            distributor_fee: processedContract.distributor_fee,
            cash_discount_fee: processedContract.cash_discount_fee,
            gpo_fee: processedContract.gpo_fee,
            labor_and_material_safety:
              processedContract.labor_and_material_safety,
            period_total_sales_volume,
            period_total_sales,
            period_total_rebates,
          },
        }
      );

      return processedContract;
    }),
});
