import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import { Data } from "./location";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const { body } = req;
    const { address } = body;
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAP_API_KEY,
        },
      }
    );
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
