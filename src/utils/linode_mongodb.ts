import { MongoClient } from "mongodb";
import "./globals";

interface Global {
  connectionPromise2?: Promise<MongoClient>;
}

declare const global: Global;

const URI = process.env.MONGODB_LINODE_URI as string;
if (!URI) throw new Error("Missing environment variable MONGODB_LINODE_URI");

const mongodb_linode_connection = async (): Promise<MongoClient> => {
  if (!global.connectionPromise2) {
    global.connectionPromise2 = MongoClient.connect(URI);
  }

  return global.connectionPromise2;
};

export default mongodb_linode_connection;
