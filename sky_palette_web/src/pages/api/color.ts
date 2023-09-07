// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    // res.status(200).json({ name: "John Doe" });
    //Find the absolute path of the json directory
    const jsonDirectory = path.join(process.cwd(), "json");
    //Read the json data file data.json
    const fileContents = await fs.readFile(
      jsonDirectory + "/data.json",
      "utf8"
    );
    res.status(200).json(JSON.parse(fileContents));
  } else if (req.method === "POST") {
    res.status(200).json({ name: "John Doe" });
  }
}
