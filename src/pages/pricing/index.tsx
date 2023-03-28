import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

const Pricing: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const contracts = api.contracts.get_all_contracts.useQuery({ searchTerm });

  return (
    <>
      <Head>
        <title>Pricing | Busse Pricing App</title>
        <meta name="description" content="Internal application for Pricing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-start gap-12 px-4 py-16 ">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[5rem] md:text-5xl">
            Busse <span className="text-[hsl(280,100%,70%)]">Pricing</span> App
          </h1>

          <div className="flex max-w-xl flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white md:flex-row">
            <h3 className="text-2xl font-bold">Search Contracts →</h3>
            <input
              type="text"
              placeholder="Contract Number"
              className="rounded-md bg-white/10 px-5 py-2 text-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:ring-opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex w-[95%] flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-white md:max-w-2xl">
            <h3 className="ml-2 w-full text-left text-2xl font-bold">
              Results →
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
                <tbody>
                  {contracts.data?.map((contract) => (
                    <tr
                      key={contract.contractnumber}
                      className="text-center hover:text-[hsl(280,100%,70%)]"
                    >
                      <td>
                        <Link href={`/pricing/${contract.contractnumber}`}>
                          {contract.contractnumber}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/pricing/${contract.contractnumber}`}>
                          {contract.contractname}
                        </Link>
                      </td>
                      <td>
                        {contract.contractstart?.toLocaleDateString() ?? ""}
                      </td>
                      <td>
                        {contract.contractend?.toLocaleDateString() ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Pricing;
