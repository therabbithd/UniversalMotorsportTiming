import Ably from 'ably';

export default async function handler(req, res) {
    if (!process.env.ABLY_API_KEY) {
        console.error('Missing ABLY_API_KEY');
        return res.status(500).json({ error: 'Missing ABLY_API_KEY environment variable' });
    }

    try {
        // Handle different import styles (CommonJS vs ESM)
        const Rest = Ably.Rest || (Ably as any).default?.Rest || Ably;
        const client = new Rest(process.env.ABLY_API_KEY);

        const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'f1-live-timing-client' });
        res.status(200).json(tokenRequestData);
    } catch (err) {
        console.error('Error requesting token:', err);
        res.status(500).json({ error: 'Error requesting token', details: err.message || err });
    }
}
