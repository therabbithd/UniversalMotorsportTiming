import type { VercelRequest, VercelResponse } from '@vercel/node';
import Ably from 'ably';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const apiKey = process.env['ABLY_API_KEY'];

  if (!apiKey) {
    console.error('Missing ABLY_API_KEY');
    return res.status(500).json({ 
      error: 'Missing ABLY_API_KEY environment variable' 
    });
  }

  try {
    const Rest = (Ably as any).Rest || (Ably as any).default?.Rest || Ably;
    const client = new Rest(apiKey);

    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: 'f1-live-timing-client',
    });

    return res.status(200).json(tokenRequestData);
  } catch (err: unknown) {
    console.error('Error requesting token:', err);

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    return res.status(500).json({ 
      error: 'Error requesting token', 
      details: errorMessage 
    });
  }
}
