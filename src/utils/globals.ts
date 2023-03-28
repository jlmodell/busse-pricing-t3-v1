import type { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      connectionPromise: Promise<MongoClient>;
    }
  }
}
