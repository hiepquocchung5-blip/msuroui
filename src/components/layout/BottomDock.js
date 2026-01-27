import React from 'react';
import { useRouter } from 'next/router';
import { Home, Users, Wallet, Trophy } from 'lucide-react';
import CharacterSVG from '../visuals/CharacterSVG';

const BottomDock = ({ activeCharId = 'luna', onNavigate, onOpenBank }) => {
  const router = useRouter();
  
  // Determine active tab based on current route
  // Clean up leading slash for comparison
  const currentPath = router.pathname.replace(/^\//, '');
  
  const isActive = (key) => {
      if (key === 'lobby' && (currentPath === 'lobby' || currentPath === '')) return true;
      return currentPath.startsWith(key);
  };

  // Handle Navigation (Use prop if available, else default to router)
  const handleNav = (path) => {
      if (onNavigate) {
          onNavigate(path);
      } else {
          router.push(`/${path}`);
      }
  };

  const handleBank = () => {
      if (onOpenBank) {
          onOpenBank();
      } else {
          router.push('/wallet');
      }
  };

  const NavItem = ({ icon: Icon, label, navKey }) => {
    const active = isActive(navKey);
    return (
      <button 
        onClick={() => handleNav(navKey)}
        className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-cyan-400 scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
        <span className="text-[9px] font-bold tracking-wider">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 h-20 z-50">
        {/* Glass Container */}
        <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]" 
            style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'}} 
        />
        
        <div className="relative h-full flex items-center justify-between px-6">
            {/* Left Group */}
            <div className="flex gap-8">
                <NavItem icon={Home} label="LOBBY" navKey="lobby" />
                <NavItem icon={Trophy} label="RANK" navKey="rank" />
            </div>

            {/* Center Floating Action Button (Active Pet / Cashier) */}
            <div className="relative -top-8 group cursor-pointer" onClick={handleBank}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-20 group-hover:opacity-50 transition-opacity animate-pulse" />
                
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-gray-800 to-black border-4 border-gray-900 shadow-2xl flex items-center justify-center overflow-hidden relative z-10 transition-transform group-active:scale-95">
                    <div className="w-full h-full transform scale-125 pt-2">
                        <CharacterSVG type={activeCharId} mood="idle" />
                    </div>
                    {/* Badge */}
                    <div className="absolute bottom-1 bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full border border-black shadow-lg">
                        CASHIER
                    </div>
                </div>
            </div>

            {/* Right Group */}
            <div className="flex gap-8">
                <NavItem icon={Users} label="GIRLS" navKey="inventory" />
                <NavItem icon={Wallet} label="PROFILE" navKey="profile" />
            </div>
        </div>
    </div>
  );
};

export default BottomDock;