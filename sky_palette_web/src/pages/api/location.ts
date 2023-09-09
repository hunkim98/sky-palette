// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
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
      if (response.data.results.length === 0) {
        res.status(404).json({ lat: null, lng: null });
        return;
      }
      const location = response.data.results[0].geometry.location;
      const lat = location.lat;
      const lng = location.lng;
      const data = {
        lat,
        lng,
      };

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    res.status(404).json({ name: "John Doe" });
  }
}
