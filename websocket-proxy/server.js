const express = require('express');
const cors = require('cors');
const pako = require('pako');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        f1Connected: !!f1Ws && f1Ws.readyState === WebSocket.OPEN,
        clients: wss ? wss.clients.size : 0,
        timestamp: new Date().toISOString()
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Railway Proxy] Running on port ${PORT}`);
});

// WebSocket Server for the Angular frontend
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('[Railway Proxy] Client connected');
    ws.on('close', () => console.log('[Railway Proxy] Client disconnected'));
});

// --- F1 Connection Logic ---

let f1Ws = null;

async function connectToF1() {
    console.log('[F1] Connecting to F1 Live Timing...');
    const SIGNALR_HUB = 'Streaming';
    const hub = encodeURIComponent(JSON.stringify([{ name: SIGNALR_HUB }]));

    try {
        const negotiateUrl = `https://livetiming.formula1.com/signalr/negotiate?connectionData=${hub}&clientProtocol=1.5`;
        const response = await fetch(negotiateUrl, {
            headers: { 'User-Agent': 'BestHTTP' }
        });

        const data = await response.json();
        const connectionToken = data.ConnectionToken;

        if (!connectionToken) {
            console.log('[F1] No session active. Retrying in 30s...');
            setTimeout(connectToF1, 30000);
            return;
        }

        const wsUrl = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodeURIComponent(connectionToken)}&connectionData=${hub}`;

        f1Ws = new WebSocket(wsUrl, {
            headers: { 'User-Agent': 'BestHTTP' }
        });

        f1Ws.on('open', () => {
            console.log('[F1] Connected to F1 WebSocket');
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
            f1Ws.send(JSON.stringify(subscribeMessage));
        });

        f1Ws.on('message', (data) => {
            processAndBroadcast(data.toString());
        });

        f1Ws.on('error', (err) => console.error('[F1] WS Error:', err));

        f1Ws.on('close', () => {
            console.log('[F1] Connection closed. Reconnecting in 10s...');
            setTimeout(connectToF1, 10000);
        });

    } catch (err) {
        console.error('[F1] Connection error:', err);
        setTimeout(connectToF1, 30000);
    }
}

function processAndBroadcast(rawData) {
    try {
        const parsed = JSON.parse(rawData);
        if (!parsed.M || !Array.isArray(parsed.M)) return;

        for (const message of parsed.M) {
            if (message.M === 'feed') {
                let [field, value] = message.A;

                // Decompress on server (Railway)
                if (field === 'CarData.z' || field === 'Position.z') {
                    const cleanField = field.split('.')[0];
                    const decompressedValue = decompress(value);
                    broadcast({ [cleanField]: decompressedValue });
                } else {
                    broadcast({ [field]: value });
                }
            }
        }
    } catch (e) {
    }
}

function decompress(data) {
    try {
        const buffer = Buffer.from(data, 'base64');
        const inflated = pako.inflateRaw(buffer, { to: 'string' });
        return JSON.parse(inflated);
    } catch (e) {
        return {};
    }
}

function broadcast(data) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

connectToF1();
