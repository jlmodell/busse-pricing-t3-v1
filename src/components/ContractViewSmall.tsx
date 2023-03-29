import type { PricingAgreement } from "~/server/api/routers/contracts";

import clsx from "clsx";

const ContractViewSmall = ({ pa }: { pa: PricingAgreement }) => {
  return (
    <div className="flex w-[95%] flex-col items-center justify-center gap-2 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 md:max-w-2xl md:gap-4">
      <div className="grid w-full grid-cols-2 place-items-center">
        <h2 className="col-span-2 text-sm font-bold underline md:text-2xl">
          General Information
        </h2>

        <h3 className="text-sm font-bold md:text-2xl">Item</h3>
        <p className="md:text-md text-sm font-extralight">{pa.item}</p>

        <h3 className="text-sm font-bold md:text-2xl">Description</h3>
        <p className="md:text-md text-sm font-extralight">{pa.description}</p>

        <h3 className="text-sm font-bold md:text-2xl">Weight</h3>
        <p className="md:text-md text-sm font-extralight">
          {pa.weight?.toFixed(0)} lb.
        </p>

        <h2 className="col-span-2 mt-4 text-sm font-bold underline md:text-2xl">
          Current
        </h2>

        <h3 className="text-sm font-bold md:text-2xl">Unit Price</h3>
        <p className="md:text-md text-sm font-extralight">
          $ {pa.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Freight Addition</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.freight_and_overhead?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Chargebacks</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.chargebacks?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Materials & Labor</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.material_and_labor?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Material Safety</h3>
        <p className="md:text-md text-sm font-extralight">
          $ {pa.safety?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Loaded Unit Cost</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.total_cost?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Margin</h3>
        <p
          className={clsx(
            "md:text-md text-sm font-extralight",
            (pa?.margin ?? 0) < 30 ? "text-red-400" : "text-green-400"
          )}
        >
          {pa.margin?.toLocaleString("en-US", { minimumFractionDigits: 3 })}%
        </p>

        <div className="col-span-2 mt-4 flex flex-col items-center justify-center">
          <h2 className="text-sm font-bold underline md:text-2xl">
            Historical
          </h2>
          <h4 className="text-xs font-bold underline md:text-xl">
            ({pa.historical_data_start?.toLocaleDateString()}→
            {pa.historical_data_end?.toLocaleDateString()})
          </h4>
        </div>

        <h3 className="text-sm font-bold md:text-2xl">Sales Volume</h3>
        <p className="md:text-md text-sm font-extralight">
          {pa.sales_volume?.toLocaleString("en-US", {
            minimumFractionDigits: 0,
          })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Gross Sales</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.total_sales?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Rebates</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.total_rebates?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Net Sales</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {((pa.total_sales ?? 0) + (pa.total_rebates ?? 0)).toLocaleString(
            "en-US",
            { minimumFractionDigits: 2 }
          )}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Avg. Unit Price</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.avg_price_paid?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}{" "}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Loaded Unit Cost</h3>
        <p className="md:text-md text-sm font-extralight">
          ${" "}
          {pa.total_costs_historical?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}{" "}
        </p>

        <h3 className="text-sm font-bold md:text-2xl">Margin</h3>
        <p
          className={clsx(
            "md:text-md text-sm font-extralight",
            (pa.difference_from_set_price_margin ?? 0) >= 30
              ? "text-green-400"
              : (pa.difference_from_set_price_margin ?? 0) < 30 &&
                (pa.difference_from_set_price_margin ?? 0) > 20
              ? "text-red-400"
              : (pa.difference_from_set_price_margin ?? 0) <= 20 &&
                (pa.difference_from_set_price_margin ?? 0) > 10
              ? "rounded-md bg-white px-1 text-red-600"
              : (pa.difference_from_set_price_margin ?? 0) <= 10 &&
                (pa.difference_from_set_price_margin ?? 0) > 0
              ? "rounded-md bg-white px-1 font-semibold text-red-800"
              : "rounded-md bg-white px-1 font-extrabold text-red-900 underline"
          )}
        >
          {pa.difference_from_set_price_margin?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
          %
        </p>
      </div>
    </div>
  );
};

export default ContractViewSmall;
