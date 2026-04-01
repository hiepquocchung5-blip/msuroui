import axios from 'axios';

// --- NEXT.JS API CONFIGURATION ---
// Increase body size limit to allow large base64 image uploads (Deposit Proofs)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', 
        },
        externalResolver: true, // Prevents Next.js warnings about unresolved API requests
    },
};

/**
 * SUROPARA V6.9.3 - ROOT API GATEWAY PROXY
 * Catches ALL traffic sent to `/api/*` and proxies it securely to the PHP backend.
 * This completely hides your PHP server address from the client's browser.
 */
export default async function handler(req, res) {
    // 1. Extract the dynamic path array and any extra query parameters (e.g., ?island_id=1)
    const { path, ...queryParams } = req.query;
    
    // 2. Resolve target PHP Backend (Fallback to localhost if env is missing)
    const backendUrl = process.env.NEXT_PUBLIC_PHP_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api';
    
    // 3. Auto-append .php to mimic standard REST architecture on the frontend
    const endpoint = path ? path.join('/') : '';
    const targetUrl = `${backendUrl}/${endpoint}.php`;

    try {
        // 4. Forward the exact request to the PHP engine
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            params: queryParams, // Pass along all standard query parameters
            headers: {
                // Pass auth token
                'Authorization': req.headers.authorization || '',
                // Ensure content type matches (usually application/json)
                'Content-Type': req.headers['content-type'] || 'application/json',
                // Forward the real client IP so PHP rate limiters & security radars work correctly
                'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
                // Forward User Agent for analytics
                'User-Agent': req.headers['user-agent'] || '',
            },
            // Prevent axios from throwing on 4xx/5xx so we can handle it manually
            validateStatus: () => true 
        });

        // 5. Pipe the response directly back to the client with the exact HTTP status code
        res.status(response.status).json(response.data);

    } catch (error) {
        // 6. Graceful Error Pipelining (Network level failures like DNS or timeouts)
        console.error(`[API_GATEWAY_ERROR] Failed to reach backend at ${targetUrl}:`, error.message);
        
        res.status(503).json({ 
            status: 'error', 
            error: 'Backend systems are currently unreachable or timing out.' 
        });
    }
}