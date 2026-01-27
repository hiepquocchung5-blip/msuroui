import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { game } from '../../services/api';

const GlobalTicker = () => {
  const [messages, setMessages] = useState([
    { type: 'jackpot', text: 'GRAND JACKPOT: Loading...', highlight: true }
  ]);
  // Default seed if API fails or hasn't loaded yet
  const [jackpot, setJackpot] = useState(5000000);

  useEffect(() => {
    let interval;
    
    const fetchTicker = async () => {
      try {
        const res = await game.getTicker();
        if (res.data.status === 'success') {
          // If the API returns messages, use them. Otherwise keep defaults or show a generic message.
          if (res.data.messages && res.data.messages.length > 0) {
            setMessages(res.data.messages);
          }
          if (res.data.jackpot_amount) {
            setJackpot(res.data.jackpot_amount);
          }
        }
      } catch (e) {
        // Silent fail for ticker logic (keep old data or set fallbacks)
        // In a real app you might want retry logic, but interval handles retries naturally
      }
    };

    // Initial fetch
    fetchTicker();
    
    // Poll every 30 seconds to update jackpot amount and recent wins
    interval = setInterval(fetchTicker, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black border-b border-white/10 h-8 flex items-center overflow-hidden relative z-30 shadow-lg">
        {/* Static Icon Box (Left Side) */}
        <div className="bg-yellow-900/40 h-full px-3 flex items-center justify-center border-r border-white/10 z-10 backdrop-blur-sm relative">
            <Trophy className="w-3 h-3 text-yellow-500 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-500 blur-md opacity-20 animate-pulse"></div>
        </div>
        
        {/* Scrolling Text Area */}
        <div className="flex-1 overflow-hidden relative">
             <div className="whitespace-nowrap animate-marquee flex gap-12 items-center text-[10px] font-mono tracking-wider absolute h-full items-center">
                {/* Map over messages. 
                  The API returns objects like { type: 'win'|'jackpot'|'info', text: '...', highlight: bool }
                */}
                {messages.map((msg, idx) => (
                    <span key={idx} className={`flex items-center gap-2 ${msg.highlight ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                        {msg.type === 'win' && (
                            <span className="text-green-400 text-[8px] border border-green-500 px-1 rounded">WIN</span>
                        )}
                        {msg.type === 'jackpot' && (
                            <span className="text-yellow-400 text-[8px] border border-yellow-500 px-1 rounded bg-yellow-900/20">JP</span>
                        )}
                        {/* Display text content */}
                        {msg.text}
                    </span>
                ))}
             </div>
        </div>
    </div>
  );
};

export default GlobalTicker;