import axios from 'axios';

// --- CONFIGURATION ---
// 1. Create a file named '.env.local' in the root of 'Suropara Frontend'
// 2. Add: NEXT_PUBLIC_API_URL=https://your-domain.com/api
// If no env var is found, it falls back to localhost for development.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://m.api.suropara.com';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Timeout to prevent hanging requests in production
    timeout: 10000, 
});

// Add Token to Requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('suro_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global Error Handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optional: Auto-logout on 401
        // if (error.response && error.response.status === 401) { ... }
        return Promise.reject(error);
    }
);

// --- ENDPOINTS ---

export const auth = {
    login: (phone, password) => api.post('/auth/login.php', { phone, password }),
    register: (phone, password, refCode) => api.post('/auth/register.php', { phone, password, ref_code: refCode }),
    logout: () => localStorage.removeItem('suro_token'),
};

export const game = {
    getIslands: () => api.get('/data/islands.php'),
    getMachines: (islandId) => api.get(`/data/machines.php?island_id=${islandId}`),
    getCharacters: () => api.get('/data/characters.php'),
    getLeaderboard: (period) => api.get(`/game/leaderboard.php?period=${period}`),
    getJackpot: () => api.get('/game/jackpot.php'),
    getTicker: () => api.get('/game/ticker.php'),

    enterMachine: (machineId) => api.post('/game/machine_actions.php', { action: 'enter', machine_id: machineId }),
    leaveMachine: (machineId) => api.post('/game/machine_actions.php', { action: 'leave', machine_id: machineId }),
    spin: (machineId, betAmount, sessionToken) => api.post('/game/spin.php', { machine_id: machineId, bet_amount: betAmount, session_token: sessionToken }),
    gamble: (choice) => api.post('/game/gamble.php', { choice }),
};

export const user = {
    getProfile: () => api.get('/user/profile.php'),
    getHistory: () => api.get('/user/history.php'),
    getItems: () => api.get('/user/items.php'),
    getNotifications: () => api.get('/user/notifications.php'), // For Header/Alerts
    claimReferral: (code) => api.post('/user/referral.php', { code }),
    equipCharacter: (charId) => api.post('/user/equip.php', { char_id: charId }),
    
    // New Referral Stats Endpoint
    getReferralStats: () => api.get('/user/referral_stats.php'),
};

export const finance = {
    deposit: (amount, provider, proof, lastDigits) => api.post('/finance/submit_request.php', { 
        type: 'deposit', 
        amount, 
        provider, 
        proof_image_base64: proof, 
        last_digits: lastDigits 
    }),
    
    // Updated to accept optional targetAdminId
    withdraw: (amount, provider, targetAdminId = null) => api.post('/finance/submit_request.php', { 
        type: 'withdraw', 
        amount, 
        provider,
        target_admin_id: targetAdminId
    }),
    
    purchaseIsland: (islandId) => api.post('/shop/purchase.php', { type: 'island', island_id: islandId }),
    purchaseCharacter: (charId) => api.post('/shop/purchase.php', { type: 'character', id: charId }),
};

export default api;