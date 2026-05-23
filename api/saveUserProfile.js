const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(mongoUri);
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { uid, city, category, conditions, sensitivities } = req.body;

    if (!uid) {
      res.statusCode = 400;
      return res.json({ ok: false, error: "Missing uid" });
    }

    const client = await getClient();
    const db = client.db("nimbus");
    const users = db.collection("users");

    const now = new Date();

    const updateDoc = {
      $set: {
        uid,
        city: city || null,
        health: {
          category: category || null,
          conditions: conditions || {},
          sensitivities: sensitivities || null,
        },
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    };

    await users.updateOne({ uid }, updateDoc, { upsert: true });

    res.statusCode = 200;
    return res.json({ ok: true, message: "Profile saved" });
  } catch (err) {
    console.error("Error saving profile", err);
    res.statusCode = 500;
    return res.json({ ok: false, error: "Internal server error" });
  }
};

