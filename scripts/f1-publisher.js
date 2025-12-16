const Ably = require('ably');
const WebSocket = require('ws');
const https = require('https');

// Configuration
const ABLY_API_KEY = process.env.ABLY_API_KEY; // Must be set in environment
const F1_BASE_URL = 'livetiming.formula1.com';
const SIGNALR_HUB = 'Streaming';

if (!ABLY_API_KEY) {
    console.error('Error: ABLY_API_KEY environment variable is not set.');
    process.exit(1);
}

// Initialize Ably
const ably = new Ably.Realtime(ABLY_API_KEY);
const channel = ably.channels.get('f1-timing');

console.log('[Publisher] Connecting to Ably...');

ably.connection.on('connected', () => {
    console.log('[Publisher] Connected to Ably');
    startF1Stream();
});

function startF1Stream() {
    console.log('[Publisher] Negotiating with F1 SignalR...');

    const hub = encodeURIComponent(JSON.stringify([{ name: SIGNALR_HUB }]));
    const negotiatePath = `/signalr/negotiate?connectionData=${hub}&clientProtocol=1.5`;

    const options = {
        hostname: F1_BASE_URL,
        path: negotiatePath,
        method: 'GET',
        headers: {
            'User-Agent': 'BestHTTP',
            'Accept-Encoding': 'gzip,identity'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                const token = json.ConnectionToken;
                if (token) {
                    console.log('[Publisher] Negotiation successful. Token obtained.');
                    connectToWebSocket(token, hub);
                } else {
                    console.error('[Publisher] Negotiation failed. No token.');
                    retry();
                }
            } catch (e) {
                console.error('[Publisher] Error parsing negotiation response:', e);
                retry();
            }
        });
    });

    req.on('error', (e) => {
        console.error(`[Publisher] Negotiation request error: ${e.message}`);
        retry();
    });

    req.end();
}

function connectToWebSocket(token, hub) {
    const wsUrl = `wss://${F1_BASE_URL}/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodeURIComponent(token)}&connectionData=${hub}`;

    console.log('[Publisher] Connecting to F1 WebSocket...');
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
        console.log('[Publisher] F1 WebSocket Open');

        // Subscribe
        const subscribeMessage = {
            H: SIGNALR_HUB,
            M: 'Subscribe',
            A: [[
                'Heartbeat', 'CarData.z', 'Position.z', 'ExtrapolatedClock', 'TimingStats',
                'TimingAppData', 'WeatherData', 'TrackStatus', 'DriverList',
                'RaceControlMessages', 'SessionInfo', 'SessionData', 'LapCount', 'TimingData', 'TeamRadio'
            ]],
            I: 1
        };

        ws.send(JSON.stringify(subscribeMessage));
    });

    ws.on('message', (data) => {
        // Forward raw data to Ably
        // We publish to 'update' event
        channel.publish('update', data.toString(), (err) => {
            if (err) {
                console.error('[Publisher] Publish error:', err);
            }
        });
    });

    ws.on('error', (err) => {
        console.error('[Publisher] F1 WebSocket Error:', err);
    });

    ws.on('close', () => {
        console.log('[Publisher] F1 WebSocket Closed');
        retry();
    });
}

function retry() {
    console.log('[Publisher] Retrying in 5 seconds...');
    setTimeout(startF1Stream, 5000);
}
