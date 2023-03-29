import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { api } from "~/utils/api";
import type { PricingAgreement } from "~/server/api/routers/contracts";

const ContractPage: NextPage = () => {
  const router = useRouter();
  const { contract } = router.query;

  const contract_query = api.contracts.get_contract.useQuery({
    contract: contract as string,
  });

  const mutation = api.contracts.set_processed_false.useMutation();

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleSetProcessedFalse = () => {
    mutation.mutate({ contract: contract as string });
  };

  useEffect(() => {
    if (contract_query.data) {
      console.log(contract_query.data);
    }
  }, [contract_query.data]);

  return (
    <>
      <Head>
        <title>Contract | Busse Pricing App</title>
        <meta name="description" content="Internal application for Pricing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16 ">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[5rem] md:text-5xl">
            Busse <span className="text-[hsl(280,100%,70%)]">Pricing</span> App
          </h1>
          {contract_query.data && (
            <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white md:max-w-2xl">
              <div className="flex w-full items-center justify-around">
                <h3 className="ml-2 w-full text-left text-sm font-bold md:text-2xl">
                  {contract_query?.data?.contractnumber} →{" "}
                  {contract_query.data.contractname}{" "}
                </h3>
                <button
                  className="text-md flex flex-col items-center justify-center rounded-md bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
                  onClick={handleSetProcessedFalse}
                >
                  <span className="text-xs font-extralight">
                    last processed:{" "}
                    {contract_query.data?.processed_last?.toLocaleDateString()}
                  </span>
                  reprocess
                </button>
              </div>
              <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white">
                <table className="w-[95%] table-fixed text-xs font-extralight md:w-full md:text-lg">
                  <thead>
                    <tr className="w-[95%] md:w-full">
                      <th className="w-1/4">Effective</th>
                      <th className="w-1/4">Dist. Fee %</th>
                      <th className="w-1/4">Disc. %</th>
                      <th className="w-1/4">Mat/Lab Safety %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td>
                        {contract_query.data.contractstart.toLocaleDateString()}{" "}
                        - {contract_query.data.contractend.toLocaleDateString()}
                      </td>
                      <td>
                        {contract_query.data.distributor_fee?.toFixed(2)}%
                      </td>
                      <td>
                        {contract_query.data.cash_discount_fee?.toFixed(2)}%
                      </td>
                      <td>
                        {contract_query.data.labor_and_material_safety?.toFixed(
                          2
                        )}
                        %
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {contract_query.data?.pricingagreements?.map((pa, idx) => (
            <SmallContractView pa={pa} key={idx} />
          ))}
        </div>
      </main>
    </>
  );
};

export default ContractPage;

const SmallContractView = ({ pa }: { pa: PricingAgreement }) => {
  return (
    <div className="flex w-[95%] flex-col items-center justify-center gap-2 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 md:max-w-2xl md:gap-4">
      <div className="grid w-full grid-cols-2 place-items-center">
        <h3 className="text-sm font-bold md:text-2xl">Item</h3>
        <p className="text-sm font-extralight">{pa.item}</p>
        <h3 className="text-sm font-bold md:text-2xl">Weight</h3>
        <p className="text-sm font-extralight">{pa.weight?.toFixed(0)} lb.</p>
        <h3 className="text-sm font-bold md:text-2xl">Price</h3>
        <p className="text-sm font-extralight">$ {pa.price.toFixed(2)}</p>
        <h3 className="text-sm font-bold md:text-2xl">Chargebacks</h3>
        <p className="text-sm font-extralight">
          $ {pa.chargebacks?.toFixed(2)}
        </p>
        <h3 className="text-sm font-bold md:text-2xl">Materials & Labor</h3>
        <p className="text-sm font-extralight">
          $ {pa.material_and_labor?.toFixed(2)}
        </p>
        <h3 className="text-sm font-bold md:text-2xl">Material Safety</h3>
        <p className="text-sm font-extralight">$ {pa.safety?.toFixed(2)}</p>
        <h3 className="text-sm font-bold md:text-2xl">Freight Addition</h3>
        <p className="text-sm font-extralight">
          $ {pa.freight_and_overhead?.toFixed(2)}
        </p>
        <h3 className="text-sm font-bold md:text-2xl">Total Cost</h3>
        <p className="text-sm font-extralight">$ {pa.total_cost?.toFixed(2)}</p>
        <h3 className="text-sm font-bold md:text-2xl">Margin</h3>
        <p className="text-sm font-extralight">{pa.margin?.toFixed(3)}%</p>
      </div>
    </div>
  );
};
