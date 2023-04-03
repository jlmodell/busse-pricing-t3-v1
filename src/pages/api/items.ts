import type { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line @typescript-eslint/require-await
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    res.status(200).json({ message: "success" });
  } else {
    res.status(400).json({ message: "not a get request" });
  }
};

export default handler;
