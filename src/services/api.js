import axios from 'axios';

// V6.9.3: Clean Real-World API Base URL
// This automatically hits the Next.js proxy at /api/[...path].js
const API_URL = '/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15s timeout for heavy cryptographic spin resolutions
});

// Auto-Inject Bearer Token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('suro_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// --- CORE ENDPOINTS ---
export const auth = {
    login: (phone, password) => api.post('/auth/login', { phone, password }),
    register: (phone, password) => api.post('/auth/register', { phone, password }),
    logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('suro_token');
    },
};

// --- GAMEPLAY & WORLD ---
export const game = {
    // World Data
    getIslands: () => api.get('/data/islands'),
    getMachines: (islandId) => api.get(`/data/machines?island_id=${islandId}`),
    getTicker: () => api.get('/game/ticker'),
    
    // Machine Interactions
    enterMachine: (machineId) => api.post('/game/machine_actions', { action: 'enter', machine_id: machineId }),
    leaveMachine: (machineId) => api.post('/game/machine_actions', { action: 'leave', machine_id: machineId }),
    pingMachine: (machineId) => api.post('/game/machine_actions', { action: 'ping', machine_id: machineId }),
    
    // Core Engine
    spin: (machineId, betAmount) => api.post('/game/spin', { machine_id: machineId, bet_amount: betAmount }),
    gamble: (choice) => api.post('/game/gamble', { choice }),
    
    // Meta Features
    getActiveEvents: () => api.get('/game/active_events'),
    getDailyBonus: () => api.get('/game/daily_bonus'),
    claimDailyBonus: () => api.post('/game/daily_bonus'),
    getVault: () => api.get('/game/vault'),
    smashVault: () => api.post('/game/vault'),
    getMissions: () => api.get('/game/missions'),
    claimMission: (missionId) => api.post('/game/missions', { mission_id: missionId }),
    getLeaderboard: (type = 'balance') => api.get(`/game/leaderboard?type=${type}`),
};

// --- USER & INVENTORY ---
export const user = {
    getProfile: () => api.get('/user/profile'),
    getHistory: () => api.get('/user/history'),
    getNotifications: () => api.get('/user/notifications'),
    
    // Characters
    getCharacters: () => api.get('/user/characters'),
    equipCharacter: (charKey) => api.post('/user/equip', { char_id: charKey }),
    
    // Referrals & Affiliates
    claimReferral: (code) => api.post('/user/referral', { code }),
    getReferralStats: () => api.get('/user/referral_stats'),
    claimCommission: () => api.post('/user/claim_commission'),
};

// --- FINANCE & BANKING ---
export const finance = {
    // Config Fetchers
    getPaymentMethods: () => api.get('/data/payment_methods'),
    getWithdrawalBanks: () => api.get('/data/withdrawal_banks'),
    getWithdrawalLimits: () => api.get('/data/withdrawal_limits'),
    getWithdrawalAgents: (provider) => api.get(`/data/withdrawal_agents?provider=${encodeURIComponent(provider)}`),
    
    // Actions
    deposit: (amount, provider, proof, lastDigits) => api.post('/finance/submit_request', { 
        type: 'deposit', 
        amount, 
        provider, 
        proof_image_base64: proof,
        last_digits: lastDigits 
    }),
    withdraw: (amount, provider, adminId = null) => api.post('/finance/submit_request', { 
        type: 'withdraw', 
        amount, 
        provider,
        target_admin_id: adminId
    }),
};

// --- SHOP & GACHA ---
export const shop = {
    unlockIsland: (islandId) => api.post('/shop/purchase', { island_id: islandId }),
    summonGacha: (type) => api.post('/shop/gacha', { type }), // type: 'standard' or 'premium'
};

// --- SOCIAL ---
export const social = {
    getChat: (lastId = 0) => api.get(`/social/chat?last_id=${lastId}`),
    sendMessage: (message) => api.post('/social/chat', { message }),
};

// --- TOURNAMENTS ---
export const tournaments = {
    getList: () => api.get('/tournaments/list'),
    join: (tournamentId) => api.post('/tournaments/join', { tournament_id: tournamentId }),
};

// --- AGENT PORTAL ---
export const agent = {
    getData: () => api.get('/agent/data'),
    transfer: (targetPhone, amount) => api.post('/agent/transfer', { target_phone: targetPhone, amount }),
};

export default api;