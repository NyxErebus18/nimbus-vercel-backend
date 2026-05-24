const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
    // 1. Setup global CORS headers for FlutterFlow
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
    }

    // 2. CRITICAL FIX: Explicitly handle a missing or undefined URI before it breaks
    if (!process.env.MONGODB_URI) {
        return res.status(500).json({ 
            ok: false, 
            message: "Backend Configuration Error: MONGODB_URI environment variable is missing or undefined inside Vercel settings." 
        });
    }

    let client;
    try {
        // Initialize client safely inside the handler scope
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db('nimbus_db'); // Double-check your exact database name here
        const collection = db.collection('user_profiles');

        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ ok: false, message: 'Missing user unique identifier (uid)' });
        }

        // Find the profile document matching the uid
        const user = await collection.findOne({ uid: uid });

        if (!user) {
            return res.status(404).json({ ok: false, message: 'User profile not found in database' });
        }

        return res.status(200).json({ ok: true, user });

    } catch (error) {
        return res.status(500).json({ ok: false, error: error.message });
    } finally {
        if (client) {
            await client.close();
        }
    }
};
