import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Trophy, Zap, Pin, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CharacterSVG from '../visuals/CharacterSVG';

// Simple sound helper if context not available here
const playPop = () => {
    try {
        const audio = new Audio('/assets/sounds/pop.mp3'); // Assuming you have this or similar
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

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/social/chat.php?last_id=${lastIdRef.current}`);
                if (res.data.status === 'success' && res.data.data.length > 0) {
                    const newMsgs = res.data.data;
                    
                    // Filter duplicates
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNew = newMsgs.filter(m => !existingIds.has(m.id));
                        
                        if (uniqueNew.length > 0) {
                            lastIdRef.current = Math.max(...uniqueNew.map(m => m.id));
                            if (!isOpen) {
                                setUnreadCount(prevCount => prevCount + uniqueNew.length);
                                playPop();
                            }
                            return [...prev, ...uniqueNew].sort((a, b) => a.id - b.id).slice(-100); // Keep last 100
                        }
                        return prev;
                    });
                }
            } catch (e) {
                // Silent fail
            }
        };

        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        fetchMessages(); // Initial load
        
        return () => clearInterval(interval);
    }, [isOpen]);

    // Auto-scroll logic
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
            // If user is not at bottom (with 50px buffer), assume they are reading history
            isUserScrolling.current = scrollHeight - scrollTop - clientHeight > 50;
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !user || isSending) return;

        const msgToSend = inputText.trim();
        setInputText(''); // Optimistic clear
        setIsSending(true);

        try {
            await api.post('/social/chat.php', { message: msgToSend });
            // Let the poller fetch it to ensure sync and order
        } catch (e) {
            console.error("Chat Error", e);
        } finally {
            setIsSending(false);
        }
    };

    // Helper to group messages by date could go here, but for now simple list
    // Helper to format time
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
                ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-black/80 backdrop-blur-md border border-white/20 hover:bg-black shadow-purple-500/20'}`}
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
                
                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
                
                {/* Online Indicator */}
                {!isOpen && unreadCount === 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black animate-pulse"></div>
                )}
            </button>

            {/* CHAT WINDOW */}
            <div className={`fixed bottom-40 right-4 w-80 h-96 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none translate-y-10'}`}>
                
                {/* Header */}
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-purple-400"/>
                        <span className="text-xs font-bold text-white tracking-widest">GLOBAL CHAT</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-green-400">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LIVE
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    ref={scrollRef} 
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar"
                >
                    {messages.length === 0 && (
                        <div className="text-center text-gray-600 text-xs mt-10">
                            No messages yet. Say hi! 👋
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isMe = parseInt(msg.user_id) === user.id;
                        const isSystem = msg.type === 'system';
                        const isWin = msg.type === 'win' || msg.type === 'jackpot';
                        const isPinned = msg.is_pinned == 1;

                        // Pinned Message Style
                        if (isPinned) {
                            return (
                                <div key={msg.id} className="sticky top-0 z-10 bg-yellow-900/90 border-l-4 border-yellow-500 p-2 rounded-r-lg text-xs shadow-md mb-2 backdrop-blur-sm">
                                    <div className="flex items-center gap-1 text-yellow-400 font-bold mb-0.5 text-[10px]">
                                        <Pin size={10} fill="currentColor" /> PINNED ANNOUNCEMENT
                                    </div>
                                    <div className="text-white font-medium">{msg.message}</div>
                                </div>
                            );
                        }
                        
                        if (isSystem) {
                            return (
                                <div key={msg.id} className="text-center my-2 opacity-80">
                                    <span className="text-[9px] bg-white/10 px-2 py-1 rounded-full text-gray-400 flex items-center justify-center gap-1 mx-auto w-fit">
                                        <Info size={8} /> {msg.message}
                                    </span>
                                </div>
                            );
                        }

                        if (isWin) {
                            return (
                                <div key={msg.id} className="bg-gradient-to-r from-yellow-900/50 to-transparent p-2 rounded-lg border-l-2 border-yellow-500 text-xs animate-in slide-in-from-left-2">
                                    <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1">
                                        <Trophy size={12}/> BIG WINNER!
                                    </div>
                                    <div className="text-white">{msg.message}</div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in duration-300`}>
                                {/* Avatar */}
                                <div className="w-6 h-6 rounded-full bg-gray-800 overflow-hidden border border-white/10 flex-shrink-0 relative mt-1">
                                    {msg.active_pet_id ? (
                                        <div className="scale-125 pt-1"><CharacterSVG type={msg.active_pet_id} mood="idle" /></div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={12}/></div>
                                    )}
                                </div>
                                
                                {/* Bubble */}
                                <div className={`flex flex-col max-w-[75%]`}>
                                    {!isMe && <div className={`text-[9px] ml-1 mb-0.5 ${msg.level > 10 ? 'text-yellow-500 font-bold' : 'text-gray-400'}`}>{msg.username}</div>}
                                    <div className={`p-2 rounded-2xl text-xs break-words relative group ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                                        {msg.message}
                                        <div className={`text-[8px] opacity-50 text-right mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                                            {formatTime(msg.created_at)}
                                        </div>
                                    </div>
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
                        placeholder={user.is_muted ? "You are muted." : "Say something..."}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        maxLength={200}
                        disabled={isSending || user.is_muted == 1}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim() || isSending || user.is_muted == 1}
                        className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale transition-all hover:bg-purple-500"
                    >
                        {isSending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14} />}
                    </button>
                </form>

            </div>
        </>
    );
}