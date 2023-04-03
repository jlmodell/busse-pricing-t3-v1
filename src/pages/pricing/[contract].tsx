import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import ContractViewSmall from "~/components/ContractViewSmall";
import { api } from "~/utils/api";

const ContractPage: NextPage = () => {
  const router = useRouter();
  const { contract } = router.query;

  const contract_query = api.contracts.get_contract.useQuery({
    contract: contract as string,
  });

  const mutation = api.contracts.set_processed_false.useMutation();

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleSetProcessedFalse = () => {
    try {
      mutation.mutate({ contract: contract as string });
      contract_query.refetch().catch(console.error);
    } catch (error) {
      console.error(error);
      alert(
        "Something went wrong processing this contract again. Please try again."
      );
    }
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
                        →{contract_query.data.contractend.toLocaleDateString()}
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

              <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white">
                <table className="w-[95%] table-fixed text-xs font-extralight md:w-full md:text-lg">
                  <thead>
                    <tr className="w-[95%] md:w-full">
                      <th className="w-1/2">Sales Volume</th>
                      <th className="w-1/2">Sales Dollars</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td>
                        {contract_query.data.period_total_sales_volume?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 0 }
                        )}{" "}
                        CS
                      </td>
                      <td>
                        ${" "}
                        {(
                          (contract_query.data.period_total_sales ?? 0) +
                          (contract_query.data.period_total_rebates ?? 0)
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {contract_query.data?.pricingagreements?.map((pa, idx) => (
            <ContractViewSmall pa={pa} key={idx} />
          ))}
        </div>
      </main>
    </>
  );
};

export default ContractPage;
