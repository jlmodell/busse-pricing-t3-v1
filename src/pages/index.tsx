import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Busse Pricing App</title>
        <meta name="description" content="Internal application for Pricing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Busse <span className="text-[hsl(280,100%,70%)]">Pricing</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/pricing"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Contracts →</h3>
              <div className="text-lg">
                Everything you need to know to process new contracts.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/tracking"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Tracking →</h3>
              <div className="text-lg">
                Track the effect of pricing increases over the life of a
                contract.
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
