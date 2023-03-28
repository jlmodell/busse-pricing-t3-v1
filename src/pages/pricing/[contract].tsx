import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { api } from "~/utils/api";
import type { Contract } from "~/server/api/routers/contracts";

const Contract: NextPage = () => {
  const router = useRouter();

  const contract = api.contracts.get_contract.useQuery({
    contract: router.query.contract as string,
  });

  useEffect(() => {
    if (contract.data) {
      console.log(contract.data);
    }
  }, [contract.data]);

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
          {contract.data && (
            <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white md:max-w-2xl">
              <h3 className="ml-2 w-full text-left text-2xl font-bold">
                {contract?.data?.contractnumber} →
              </h3>
              <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white">
                <table className="w-[95%] table-fixed text-xs font-extralight md:w-full md:text-lg">
                  <thead>
                    <tr className="w-[95%] md:w-full">
                      <th className="w-1/4">Contract</th>
                      <th className="min-w-1/2 w-1/2">Name</th>
                      <th className="w-1/4">Start</th>
                      <th className="w-1/4">End</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
          )}
          <SmallContractView pa={contract.data?.pricingagreements} />
        </div>
      </main>
    </>
  );
};

export default Contract;

const SmallContractView = ({ pa }: { pa: Contract["pricingagreements"] }) => {
  console.log(pa);
  return (
    <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white md:max-w-2xl">
      <h2 className="ml-2 w-full text-left text-2xl font-bold">Pricing</h2>
    </div>
  );
};
