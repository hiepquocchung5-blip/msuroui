import axios from 'axios';

/**
 * API GATEWAY PROXY
 * This file masks the true PHP backend. The browser network tab will only see 
 * calls to `/api/proxy/game/spin`, hiding `apisuro.online` completely.
 */
export default async function handler(req, res) {
    const { path } = req.query;
    
 
    const backendUrl = process.env.PHP_BACKEND_URL ;
    const targetUrl = `${backendUrl}/${path.join('/')}.php`;

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            params: req.query,
            headers: {
                'Authorization': req.headers.authorization || '',
                'Content-Type': 'application/json',
                // Pass the real client IP to the PHP backend for security tracking
                'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        // Forward the exact error from PHP to the frontend gracefully
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Gateway Proxy Error' });
    }
}