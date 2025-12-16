import Ably from 'ably';

export default async function handler(req, res) {
    if (!process.env.ABLY_API_KEY) {
        return res.status(500).json({ error: 'Missing ABLY_API_KEY environment variable' });
    }

    const client = new Ably.Rest(process.env.ABLY_API_KEY);

    try {
        const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'f1-live-timing-client' });
        res.status(200).json(tokenRequestData);
    } catch (err) {
        res.status(500).json({ error: 'Error requesting token: ' + JSON.stringify(err) });
    }
}
