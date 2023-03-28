import { type NextPage } from "next";
import Head from "next/head";
// import Link from "next/link";

// import { api } from "~/utils/api";

const Tracking: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tracking | Busse Pricing App</title>
        <meta name="description" content="Internal application for Pricing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Busse <span className="text-[hsl(280,100%,70%)]">Tracking</span> App
          </h1>
        </div>
      </main>
    </>
  );
};

export default Tracking;
