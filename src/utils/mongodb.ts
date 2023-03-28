import { MongoClient } from "mongodb";
import "./globals";

interface Global {
  connectionPromise?: Promise<MongoClient>;
}

declare const global: Global;

const URI = process.env.MONGODB_ATLAS_URI as string;
if (!URI) throw new Error("Missing environment variable MONGODB_ATLAS_URI");

const mongodb_atlas_connection = async (): Promise<MongoClient> => {
  if (!global.connectionPromise) {
    global.connectionPromise = MongoClient.connect(URI);
  }

  return global.connectionPromise;
};

export default mongodb_atlas_connection;
