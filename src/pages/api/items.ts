import mongodb_atlas_connection from "~/utils/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const client = await mongodb_atlas_connection();
    const db = client.db("bussepricing");
    const collection = db.collection("items");
    const costs_collection = db.collection("costs");

    const costs = (await costs_collection
      .find({ alias: { $exists: true } })
      .toArray()) as unknown as {
      item: string;
      alias: string;
    }[];

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    costs.forEach(async (cost) => {
      if (!cost.item) return;
      const filter_by = cost?.item?.split("-")?.[0]?.trim();
      await collection.updateOne(
        { item: filter_by },
        { $set: { alias: cost.alias } }
      );
    });

    res.status(200).json({ message: "success" });
  } else {
    res.status(400).json({ message: "not a get request" });
  }
};

export default handler;
