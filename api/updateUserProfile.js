import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { uid, username } = req.body;

    if (!uid) {
      return res.status(400).json({ ok: false, message: "Missing uid" });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("nimbus");
    const users = db.collection("users");

    const result = await users.updateOne(
      { uid },
      {
        $set: {
          username,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({ ok: true, message: "Profile updated" });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
