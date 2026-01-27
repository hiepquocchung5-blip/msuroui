import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Trophy, Zap } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CharacterSVG from '../visuals/CharacterSVG';

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);
    const lastIdRef = useRef(0);

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // Pass last_id to only get new stuff
                const res = await api.get(`/social/chat.php?last_id=${lastIdRef.current}`);
                if (res.data.status === 'success' && res.data.data.length > 0) {
                    const newMsgs = res.data.data;
                    lastIdRef.current = newMsgs[newMsgs.length - 1].id;
                    
                    setMessages(prev => {
                        // Avoid duplicates if strict mode double-renders or network lag
                        const ids = new Set(prev.map(m => m.id));
                        const uniqueNew = newMsgs.filter(m => !ids.has(m.id));
                        return [...prev, ...uniqueNew].slice(-50); // Keep last 50
                    });
                    
                    // Auto-scroll if near bottom or first load
                    setTimeout(() => {
                        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }, 100);
                }
            } catch (e) {
                // Silent fail
            }
        };

        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        fetchMessages(); // Initial
        
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !user || isSending) return;

        const msgToSend = inputText.trim();
        setInputText(''); // Optimistic clear
        setIsSending(true);

        try {
            await api.post('/social/chat.php', { message: msgToSend });
            // Let the poller fetch it to ensure sync
        } catch (e) {
            console.error("Chat Error", e);
        } finally {
            setIsSending(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* FLOATING BUTTON (Visible when closed) */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-black/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-all hover:bg-black"
                >
                    <MessageSquare size={20} />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black animate-pulse"></div>
                </button>
            )}

            {/* CHAT WINDOW */}
            <div className={`fixed bottom-24 right-4 w-80 h-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                
                {/* Header */}
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-purple-400"/>
                        <span className="text-xs font-bold text-white tracking-widest">GLOBAL CHAT</span>
                    </div>
                    <button onClick={() => setIsOpen(false)}><X size={16} className="text-gray-400 hover:text-white"/></button>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
                    {messages.map((msg) => {
                        const isMe = parseInt(msg.user_id) === user.id;
                        const isSystem = msg.type === 'system';
                        const isWin = msg.type === 'win' || msg.type === 'jackpot';
                        
                        if (isSystem) {
                            return (
                                <div key={msg.id} className="text-center my-2">
                                    <span className="text-[9px] bg-white/10 px-2 py-1 rounded-full text-gray-400">{msg.message}</span>
                                </div>
                            );
                        }

                        if (isWin) {
                            return (
                                <div key={msg.id} className="bg-gradient-to-r from-yellow-900/50 to-transparent p-2 rounded-lg border-l-2 border-yellow-500 text-xs">
                                    <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1">
                                        <Trophy size={12}/> BIG WINNER!
                                    </div>
                                    <div className="text-white">{msg.message}</div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden border border-white/10 flex-shrink-0 relative">
                                    {msg.active_pet_id ? (
                                        <div className="scale-125 pt-1"><CharacterSVG type={msg.active_pet_id} mood="idle" /></div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={12}/></div>
                                    )}
                                </div>
                                
                                {/* Bubble */}
                                <div className={`max-w-[75%] p-2 rounded-xl text-xs ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                                    {!isMe && <div className={`font-bold text-[9px] mb-0.5 ${msg.level > 10 ? 'text-yellow-400' : 'text-gray-400'}`}>{msg.username}</div>}
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2 bg-black/50 rounded-b-2xl">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Say something..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                        maxLength={200}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim() || isSending}
                        className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        <Send size={14} />
                    </button>
                </form>

            </div>
        </>
    );
}