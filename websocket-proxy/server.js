const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (adjust in production)
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy HTTP requests to F1 API
app.use('/f1-api', createProxyMiddleware({
    target: 'https://livetiming.formula1.com',
    changeOrigin: true,
    pathRewrite: {
        '^/f1-api': '', // Remove /f1-api prefix
    },
    onProxyReq: (proxyReq) => {
        // Add required headers
        proxyReq.setHeader('User-Agent', 'BestHTTP');
        proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
    },
    // Enable WebSocket proxying
    ws: true,
    onProxyReqWs: (proxyReq) => {
        // Add required headers for WebSocket
        proxyReq.setHeader('User-Agent', 'BestHTTP');
        proxyReq.setHeader('Origin', 'https://livetiming.formula1.com');
    },
    logLevel: 'debug'
}));

const server = app.listen(PORT, () => {
    console.log(`[Proxy Server] Running on port ${PORT}`);
    console.log(`[Proxy Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[Proxy Server] F1 API proxy: http://localhost:${PORT}/f1-api/*`);
});

// Enable WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
    console.log('[Proxy Server] WebSocket upgrade request:', req.url);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Proxy Server] SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('[Proxy Server] Server closed');
        process.exit(0);
    });
});
