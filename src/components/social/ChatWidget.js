import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Trophy, Pin, Info, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CharacterSVG from '../visuals/CharacterSVG';

const playPop = () => {
    try {
        const audio = new Audio('/assets/sounds/pop.mp3'); 
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } catch(e) {}
};

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const scrollRef = useRef(null);
    const lastIdRef = useRef(0);
    const isUserScrolling = useRef(false);
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // --- REAL-TIME SSE CONNECTION (SECURED) ---
    useEffect(() => {
        const connectSSE = () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            // Grab the token manually since EventSource ignores Axios interceptors
            const token = typeof window !== 'undefined' ? localStorage.getItem('suro_token') : '';
            if (!token) return; // Prevent unauthenticated ghost connections

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
            
            // Pass the token in the query string so PHP can authenticate the stream
            const streamUrl = `${baseUrl}/social/chat_stream.php?last_id=${lastIdRef.current}&token=${token}`;
            
            const sse = new EventSource(streamUrl);
            eventSourceRef.current = sse;

            sse.onmessage = (event) => {
                try {
                    const res = JSON.parse(event.data);
                    if (res.status === 'success' && res.data.length > 0) {
                        const newMsgs = res.data;
                        
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const uniqueNew = newMsgs.filter(m => !existingIds.has(m.id));
                            
                            if (uniqueNew.length > 0) {
                                lastIdRef.current = Math.max(...uniqueNew.map(m => m.id));
                                
                                setIsOpen(currentIsOpen => {
                                    if (!currentIsOpen) {
                                        setUnreadCount(prevCount => prevCount + uniqueNew.length);
                                        playPop();
                                    }
                                    return currentIsOpen;
                                });

                                return [...prev, ...uniqueNew].sort((a, b) => a.id - b.id).slice(-100); 
                            }
                            return prev;
                        });
                    }
                } catch (e) {
                    console.error("SSE Parse Error", e);
                }
            };

            sse.addEventListener('error', (event) => {
                if (event.data) {
                    try {
                        const errorData = JSON.parse(event.data);
                        console.warn("Server SSE Warning:", errorData.message);
                    } catch (e) {}
                }
            });

            sse.onerror = () => {
                console.warn("SSE Connection lost. Reconnecting...");
                sse.close(); 
                
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectSSE();
                }, 3000);
            };
        };

        if (user) {
            connectSSE();
        }

        return () => {
            clearTimeout(reconnectTimeoutRef.current);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [user]);

    // --- SCROLL MANAGEMENT ---
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            if (scrollRef.current && !isUserScrolling.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages, isOpen]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            isUserScrolling.current = scrollHeight - scrollTop - clientHeight > 50;
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !user || isSending) return;

        const msgToSend = inputText.trim();
        setInputText(''); 
        setIsSending(true);

        try {
            await api.post('/social/chat.php', { message: msgToSend });
        } catch (e) {
            console.error("Chat Error", e);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <>
            {/* FLOATING BUTTON */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all duration-300
                ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-black/80 backdrop-blur-md border border-cyan-500/20 hover:bg-black shadow-[0_0_15px_rgba(0,243,255,0.2)]'}`}
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
                
                {!isOpen && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
                
                {!isOpen && unreadCount === 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-500 rounded-full border border-black shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse"></div>
                )}
            </button>

            {/* CHAT WINDOW (CIRCUIT CHAOS THEME) */}
            <div className={`fixed bottom-40 right-4 w-80 h-96 bg-[#050505]/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none translate-y-10'}`}>
                
                {/* Header */}
                <div className="p-3 border-b border-cyan-500/20 flex justify-between items-center bg-gradient-to-r from-cyan-900/20 to-transparent rounded-t-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                    <div className="flex items-center gap-2 relative z-10">
                        <MessageSquare size={16} className="text-cyan-400"/>
                        <span className="text-xs font-black text-white tracking-widest italic">GLOBAL COMM</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono relative z-10">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_rgba(0,243,255,1)] animate-pulse"></span> LIVE
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    ref={scrollRef} 
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar relative"
                >
                    {messages.length === 0 && (
                        <div className="text-center text-cyan-500/50 text-xs mt-10 font-mono uppercase tracking-widest">
                            Establishing secure connection...
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMe = parseInt(msg.user_id) === user.id;
                        const isSystem = msg.type === 'system';
                        const isWin = msg.type === 'win' || msg.type === 'jackpot';
                        const isPinned = msg.is_pinned == 1;

                        if (isPinned) {
                            return (
                                <div key={msg.id} className="sticky top-0 z-10 bg-yellow-900/90 border-l-4 border-yellow-500 p-2 rounded-r-lg text-xs shadow-md mb-2 backdrop-blur-sm">
                                    <div className="flex items-center gap-1 text-yellow-400 font-black mb-0.5 text-[10px] uppercase tracking-widest">
                                        <Pin size={10} fill="currentColor" /> System Broadcast
                                    </div>
                                    <div className="text-white font-medium">{msg.message}</div>
                                </div>
                            );
                        }
                        
                        if (isSystem) {
                            return (
                                <div key={msg.id} className="text-center my-2 opacity-80">
                                    <span className="text-[9px] bg-cyan-900/20 border border-cyan-500/30 px-2 py-1 rounded-full text-cyan-400 font-mono flex items-center justify-center gap-1 mx-auto w-fit">
                                        <Info size={8} /> {msg.message}
                                    </span>
                                </div>
                            );
                        }

                        if (isWin) {
                            return (
                                <div key={msg.id} className="bg-gradient-to-r from-yellow-900/50 to-transparent p-2 rounded-lg border-l-2 border-yellow-500 text-xs animate-in slide-in-from-left-2">
                                    <div className="flex items-center gap-2 text-yellow-400 font-black mb-1 uppercase tracking-widest">
                                        <Trophy size={12}/> High Roller
                                    </div>
                                    <div className="text-white">{msg.message}</div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in duration-300`}>
                                {/* Avatar */}
                                <div className={`w-6 h-6 rounded-full overflow-hidden border flex-shrink-0 relative mt-1 bg-black ${isMe ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'border-white/10'}`}>
                                    {msg.active_pet_id ? (
                                        <div className="scale-125 pt-1"><CharacterSVG type={msg.active_pet_id} mood="idle" /></div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={12}/></div>
                                    )}
                                </div>
                                
                                {/* Bubble */}
                                <div className={`flex flex-col max-w-[75%]`}>
                                    {!isMe && <div className={`text-[9px] ml-1 mb-0.5 font-bold uppercase tracking-widest ${msg.level > 10 ? 'text-yellow-500' : 'text-gray-500'}`}>{msg.username}</div>}
                                    <div className={`p-2 rounded-2xl text-xs break-words relative group ${isMe ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'}`}>
                                        {msg.message}
                                        <div className={`text-[8px] opacity-50 text-right mt-1 font-mono ${isMe ? 'text-cyan-200' : 'text-gray-500'}`}>
                                            {formatTime(msg.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 border-t border-cyan-500/20 flex gap-2 bg-black/50 rounded-b-2xl">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={user.is_muted ? "COMMUNICATIONS DISABLED." : "Transmit message..."}
                        className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        maxLength={200}
                        disabled={isSending || user.is_muted == 1}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim() || isSending || user.is_muted == 1}
                        className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-black shadow-[0_0_10px_rgba(0,243,255,0.5)] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all hover:bg-cyan-400"
                    >
                        {isSending ? <Loader2 size={14} className="animate-spin text-black"/> : <Send size={14} className="ml-0.5" />}
                    </button>
                </form>

            </div>
        </>
    );
}