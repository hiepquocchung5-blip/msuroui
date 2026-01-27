import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { game, finance, user as userApi } from '../services/api';
import { Check, Lock, RefreshCw, AlertCircle, Filter, Zap, Shield, Star, Crown, Info } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import CharacterSVG from '../components/visuals/CharacterSVG';
import BottomDock from '../components/layout/BottomDock';

export default function Inventory() {
  const { user, loading, updateBalance, updateActivePet } = useAuth();
  const router = useRouter();
  
  // State
  const [activeTab, setActiveTab] = useState('owned'); 
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [equipping, setEquipping] = useState(null);
  const [buying, setBuying] = useState(null);
  
  const [allCharacters, setAllCharacters] = useState([]);
  const [ownedIds, setOwnedIds] = useState([]); // Array of char_keys
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Derived Active Pet Object
  const activePetObj = allCharacters.find(c => c.char_key === user?.active_pet_id);

  const fetchData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
          const res = await game.getCharacters();
          if (res.data.status === 'success') {
              setAllCharacters(res.data.data);
              
              // Calculate ownership based on API data
              // Logic: User owns if price is 0 OR they own the island
              if(user?.owned_islands) {
                  const owned = res.data.data
                    .filter(c => user.owned_islands.includes(c.island_id) || parseFloat(c.price) === 0)
                    .map(c => c.char_key);
                  setOwnedIds(owned);
              }
          } else {
              throw new Error("Failed to load character roster.");
          }
      } catch(e) { 
          console.error("Inventory API error", e);
          setError("Unable to connect to server roster.");
      } finally {
          setIsLoadingData(false);
      }
  };

  useEffect(() => {
      if(user) fetchData();
  }, [user]);

  const handleEquip = async (charKey) => {
      setEquipping(charKey);
      try {
          const res = await userApi.equipCharacter(charKey);
          if (res.data.status === 'success') {
              updateActivePet(charKey);
              // Optional: Show success toast
          }
      } catch (e) {
          alert(e.response?.data?.error || "Failed to equip character");
      } finally {
          setEquipping(null);
      }
  };

  const handleBuy = async (char) => {
      if (parseFloat(user.balance) < parseFloat(char.price)) {
          alert("Insufficient Funds");
          return;
      }
      if (confirm(`Unlock ${char.name} for ${parseFloat(char.price).toLocaleString()} MMK?`)) {
          setBuying(char.char_key);
          try {
              // Purchase logic usually handled by buying the island or specific item
              // Assuming /shop/purchase handles character unlock via 'type'
              await finance.purchaseCharacter(char.id); 
              updateBalance(user.balance - char.price);
              setOwnedIds(prev => [...prev, char.char_key]);
              alert("Character Unlocked!");
          } catch (e) {
              alert(e.response?.data?.error || "Purchase failed");
          } finally {
              setBuying(null);
          }
      }
  };

  const getRarityColor = (r) => {
      if(r === 'UR') return 'text-purple-400 border-purple-500 bg-purple-900/50 shadow-[0_0_10px_purple]';
      if(r === 'SSR') return 'text-yellow-400 border-yellow-500 bg-yellow-900/50 shadow-[0_0_10px_gold]';
      if(r === 'SR') return 'text-red-400 border-red-500 bg-red-900/50';
      return 'text-gray-300 border-gray-500 bg-gray-800';
  };

  if (loading || !user) return <div className="bg-black min-h-screen text-cyan-500 flex items-center justify-center">Loading...</div>;

  // Filter Logic
  let displayList = activeTab === 'owned' 
    ? allCharacters.filter(c => ownedIds.includes(c.char_key))
    : allCharacters.filter(c => !ownedIds.includes(c.char_key));
  
  if (filterRarity !== 'ALL') {
      displayList = displayList.filter(c => {
          // Parse the JSON stored in svg_data from SQL
          try {
              const meta = c.svg_data ? JSON.parse(c.svg_data) : {};
              return meta.rarity === filterRarity;
          } catch (e) { return false; }
      });
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-black pointer-events-none" />

        <div className="p-6 pt-8 relative z-10">
            
            {/* HERO: Active Pet */}
            <div className="flex items-center justify-between mb-6">
                 <div>
                     <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">Active Companion</div>
                     <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
                         {activePetObj?.name || 'Loading...'}
                     </h1>
                 </div>
                 <div className="w-16 h-16 rounded-full border-2 border-cyan-500 shadow-[0_0_15px_cyan] overflow-hidden bg-black relative">
                     <div className="absolute inset-0 scale-125 pt-2">
                        <CharacterSVG type={user.active_pet_id} mood="idle" />
                     </div>
                 </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
                 <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 flex-1">
                    <button onClick={() => setActiveTab('owned')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'owned' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>ROSTER</button>
                    <button onClick={() => setActiveTab('shop')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'shop' ? 'bg-yellow-600 text-black shadow-lg' : 'text-gray-500'}`}>SCOUT</button>
                </div>
                <button onClick={fetchData} className="w-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white">
                    <RefreshCw size={16} className={isLoadingData ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Rarity Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
                {['ALL', 'UR', 'SSR', 'SR', 'R'].map(r => (
                    <button 
                        key={r} 
                        onClick={() => setFilterRarity(r)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black border transition-all ${filterRarity === r ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-700'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {error ? (
                <div className="text-center text-red-400 py-10 text-sm flex flex-col items-center gap-2"><AlertCircle size={24}/> {error}</div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {displayList.map(char => {
                        const isEquipped = user.active_pet_id === char.char_key;
                        const isProcessing = equipping === char.char_key || buying === char.char_key;
                        
                        // Parse Metadata safely
                        let meta = { rarity: 'R', element: 'Unknown', desc: '' };
                        try { if(char.svg_data) meta = JSON.parse(char.svg_data); } catch(e){}
                        
                        return (
                            <GlassCard key={char.id} className={`p-0 overflow-hidden relative group ${isEquipped ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : ''}`}>
                                {/* Card Header */}
                                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${getRarityColor(meta.rarity)}`}>
                                        {meta.rarity}
                                    </span>
                                </div>
                                
                                {/* Image */}
                                <div className="h-40 relative bg-gradient-to-b from-gray-800/50 to-transparent flex items-end justify-center pb-2">
                                    <div className="w-full h-full absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center pt-4">
                                        <CharacterSVG type={char.char_key} mood={isEquipped ? 'win' : 'idle'} scale={1.2} />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-xs font-bold text-white truncate w-20">{char.name}</div>
                                        <div className="text-[9px] text-gray-400">{meta.element}</div>
                                    </div>
                                    <div className="text-[8px] text-gray-500 mb-2 truncate">{meta.desc}</div>
                                    
                                    {activeTab === 'owned' ? (
                                        <button onClick={() => handleEquip(char.char_key)} disabled={isEquipped || isProcessing}
                                            className={`w-full py-2 rounded text-[9px] font-bold transition-all flex items-center justify-center gap-1 ${isEquipped ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50'}`}>
                                            {isProcessing ? '...' : (isEquipped ? <><Check size={10}/> ACTIVE</> : 'EQUIP')}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleBuy(char)} disabled={isProcessing} className="w-full py-2 rounded text-[9px] font-bold bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg flex items-center justify-center gap-1 disabled:opacity-50">
                                            {isProcessing ? '...' : <><Lock size={10} /> {parseFloat(char.price) > 0 ? (char.price/1000) + 'k' : 'FREE'}</>}
                                        </button>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
            
            {!isLoadingData && !error && displayList.length === 0 && (
                <div className="text-center text-gray-500 mt-10 text-xs">No characters found in this category.</div>
            )}
        </div>
        <BottomDock activeCharId={user?.active_pet_id} onNavigate={(path) => router.push(`/${path}`)} onOpenBank={() => router.push('/wallet')} />
    </div>
  );
}