import axios from 'axios';

// ============================================================================
// SUROPARA V6.9.6 - DIRECT API SERVICE
// Architecture: Direct Backend Connection (Proxy Bypassed)
// Fixes: "400 Header Too Large" caused by Next.js cookie bloat.
// ============================================================================

// Fallback directly to the live domain if the .env variable is missing.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apisuro.online/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
    login: (phone, password) => api.post('/auth/login.php', { phone, password }),
    register: (phone, password) => api.post('/auth/register.php', { phone, password }),
    logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('suro_token');
    },
};

// --- GAMEPLAY & WORLD ---
export const game = {
    getIslands: () => api.get('/data/islands.php'),
    getMachines: (islandId) => api.get(`/data/machines.php?island_id=${islandId}`),
    getTicker: () => api.get('/game/ticker.php'),
    
    enterMachine: (machineId) => api.post('/game/machine_actions.php', { action: 'enter', machine_id: machineId }),
    leaveMachine: (machineId) => api.post('/game/machine_actions.php', { action: 'leave', machine_id: machineId }),
    pingMachine: (machineId) => api.post('/game/machine_actions.php', { action: 'ping', machine_id: machineId }),
    
    spin: (machineId, betAmount) => api.post('/game/spin.php', { machine_id: machineId, bet_amount: betAmount }),
    gamble: (choice) => api.post('/game/gamble.php', { choice }),
    
    getActiveEvents: () => api.get('/game/active_events.php'),
    getDailyBonus: () => api.get('/game/daily_bonus.php'),
    claimDailyBonus: () => api.post('/game/daily_bonus.php'),
    getVault: () => api.get('/game/vault.php'),
    smashVault: () => api.post('/game/vault.php'),
    getMissions: () => api.get('/game/missions.php'),
    claimMission: (missionId) => api.post('/game/missions.php', { mission_id: missionId }),
    getLeaderboard: (type = 'balance') => api.get(`/game/leaderboard.php?type=${type}`),
};

// --- USER & INVENTORY ---
export const user = {
    getProfile: () => api.get('/user/profile.php'),
    getHistory: () => api.get('/user/history.php'),
    getNotifications: () => api.get('/user/notifications.php'),
    
    getCharacters: () => api.get('/user/characters.php'),
    equipCharacter: (charKey) => api.post('/user/equip.php', { char_id: charKey }),
    
    claimReferral: (code) => api.post('/user/referral.php', { code }),
    getReferralStats: () => api.get('/user/referral_stats.php'),
    claimCommission: () => api.post('/user/claim_commission.php'),
};

// --- FINANCE & BANKING ---
export const finance = {
    getPaymentMethods: () => api.get('/data/payment_methods.php'),
    getWithdrawalBanks: () => api.get('/data/withdrawal_banks.php'),
    getWithdrawalLimits: () => api.get('/data/withdrawal_limits.php'),
    getWithdrawalAgents: (provider) => api.get(`/data/withdrawal_agents.php?provider=${encodeURIComponent(provider)}`),
    
    deposit: (amount, provider, proof, lastDigits) => api.post('/finance/submit_request.php', { 
        type: 'deposit', amount, provider, proof_image_base64: proof, last_digits: lastDigits 
    }),
    withdraw: (amount, provider, adminId = null) => api.post('/finance/submit_request.php', { 
        type: 'withdraw', amount, provider, target_admin_id: adminId
    }),
};

// --- SHOP & GACHA ---
export const shop = {
    unlockIsland: (islandId) => api.post('/shop/purchase.php', { island_id: islandId }),
    summonGacha: (type) => api.post('/shop/gacha.php', { type }),
};

// --- SOCIAL ---
export const social = {
    getChat: (lastId = 0) => api.get(`/social/chat.php?last_id=${lastId}`),
    sendMessage: (message) => api.post('/social/chat.php', { message }),
};

// --- TOURNAMENTS ---
export const tournaments = {
    getList: () => api.get('/tournaments/list.php'),
    join: (tournamentId) => api.post('/tournaments/join.php', { tournament_id: tournamentId }),
};

// --- AGENT PORTAL ---
export const agent = {
    getData: () => api.get('/agent/data.php'),
    transfer: (targetPhone, amount) => api.post('/agent/transfer.php', { target_phone: targetPhone, amount }),
};

export default api;