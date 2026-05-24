import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { uid } = req.body;

    if (!uid || typeof uid !== "string") {
      return res.status(400).json({ ok: false, message: "Invalid or missing uid" });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("nimbus");
    const users = db.collection("users");

    const user = await users.findOne({ uid });

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    return res.status(200).json({ ok: true, user });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
