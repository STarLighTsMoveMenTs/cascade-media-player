import React, { useState, useEffect } from 'react';
import { LocationData, locations } from './HologramScene';
import { AudioReactor } from './AudioReactor';

interface UIOverlayProps {
  selectedLocation: LocationData | null;
  onSelectLocation: (data: LocationData) => void;
  phoenixMode: boolean;
  setPhoenixMode: (active: boolean) => void;
  onFlash: (type: 'single' | 'double' | 'soft') => void;
}

// Reusable Tech Border Component - REFINED: Brighter borders and background for max visibility
const TechBox = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`relative border border-white/20 bg-slate-900/70 backdrop-blur-md animate-border-pulse ${className}`}>
        {/* Corner Accents - Brighter */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-l border-t border-cyan-400"></div>
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-r border-t border-cyan-400"></div>
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-l border-b border-cyan-400"></div>
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-r border-b border-cyan-400"></div>
        {children}
    </div>
);

export const UIOverlay: React.FC<UIOverlayProps> = ({ selectedLocation, onSelectLocation, phoenixMode, setPhoenixMode, onFlash }) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [latency, setLatency] = useState(18);
  const [packetFlow, setPacketFlow] = useState(4.9);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
        setLatency(prev => Math.max(12, Math.min(45, prev + (Math.random() - 0.5) * 5)));
        setPacketFlow(prev => Math.max(2.0, Math.min(9.9, prev + (Math.random() - 0.5) * 0.5)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const themeColor = phoenixMode ? "text-amber-500" : "text-cyan-400";
  const borderColor = phoenixMode ? "border-amber-500/50" : "border-cyan-500/30";

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4 md:p-8 font-['Rajdhani'] overflow-hidden">
      
      {/* --- PHOENIX OVERLAY ALERT --- */}
      <div className={`absolute inset-0 bg-red-950/20 pointer-events-none transition-opacity duration-1000 flex items-center justify-center z-0 ${phoenixMode ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-px bg-amber-500/50 absolute top-1/2 left-0 animate-pulse"></div>
          <div className="h-full w-px bg-amber-500/50 absolute top-0 left-1/2 animate-pulse"></div>
          <div className="bg-black/90 border border-amber-500 p-12 text-center animate-bounce-slow backdrop-blur-xl shadow-[0_0_100px_rgba(245,158,11,0.5)]">
             <h1 className="text-7xl font-bold text-amber-500 tracking-[0.2em] animate-pulse">SYSTEM OVERRIDE</h1>
             <p className="text-amber-200/80 mt-4 tracking-widest text-2xl uppercase">Protocol Level: Omega</p>
          </div>
      </div>

      {/* --- SIDEBAR PHOENIX TRIGGER (Top Right, Skewed) --- */}
      <button
        onClick={() => setPhoenixMode(!phoenixMode)}
        className={`
            fixed top-64 right-0 pointer-events-auto z-50
            transform transition-all duration-500 ease-out origin-right
            ${phoenixMode ? 'translate-x-0' : 'translate-x-2 hover:translate-x-0'}
        `}
      >
          {/* Skewed Container */}
          <div className={`
             relative pl-10 pr-6 py-4
             transform -skew-x-[20deg] translate-x-4
             border-l-4 border-b border-t border-white/20
             shadow-[-10px_5px_30px_rgba(0,0,0,0.6)]
             overflow-hidden
             group
             ${phoenixMode 
                ? 'bg-amber-950/90 border-l-amber-500 border-t-amber-500/30' 
                : 'bg-slate-800/95 border-l-cyan-500 border-t-cyan-500/30 hover:bg-slate-700'}
          `}>
             {/* Hazard Stripes Background for Active Mode */}
             {phoenixMode && (
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fbbf24 10px, #fbbf24 20px)'}}>
                 </div>
             )}

             {/* Content (Counter-skewed to be straight) */}
             <div className="transform skew-x-[20deg] flex flex-col items-end gap-1">
                 <div className="flex items-center gap-3">
                    {/* Status LED */}
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${phoenixMode ? 'bg-amber-500 animate-[ping_1s_infinite] text-amber-500' : 'bg-cyan-400 text-cyan-400'}`}></div>
                    
                    <span className={`font-bold tracking-[0.2em] text-lg uppercase ${phoenixMode ? 'text-amber-500' : 'text-cyan-300 group-hover:text-white'}`}>
                        {phoenixMode ? 'PHOENIX ACTIVE' : 'ACTIVATE PHOENIX'}
                    </span>
                 </div>
                 <span className="text-[10px] text-slate-300 tracking-widest uppercase font-mono">
                    {phoenixMode ? 'SECURE CHANNEL OPEN' : 'WAITING FOR INPUT'}
                 </span>
             </div>
          </div>
      </button>

      {/* --- HEADER --- */}
      <div className="w-full flex justify-between items-start z-10">
        {/* Left HUD: Latency/Stats */}
        <div className="flex flex-col gap-2 w-48 hidden md:flex">
             <TechBox className="p-4">
                <div className="text-[10px] tracking-widest text-slate-200 uppercase mb-1">Network Latency</div>
                <div className={`text-2xl font-bold ${themeColor} font-mono`}>{latency.toFixed(0)} ms</div>
                <div className="w-full bg-slate-700 h-px mt-2">
                    <div className={`h-full ${phoenixMode ? 'bg-amber-500' : 'bg-cyan-400'} transition-all duration-300`} style={{ width: `${(latency/50)*100}%` }}></div>
                </div>
             </TechBox>
             
             <div className="flex justify-between text-[10px] text-slate-300 font-mono tracking-widest mt-1">
                <span>NODES: 18,441</span>
                <span>SYNC: 100%</span>
             </div>
        </div>

        {/* Center Title */}
        <div className="flex flex-col items-center">
            <h1 className={`text-4xl md:text-5xl font-bold tracking-[0.15em] transition-colors duration-700 ${phoenixMode ? 'text-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]' : 'text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}>
            GLOBAL<span className={themeColor}>CONNECT</span>
            </h1>
            <div className={`h-px w-full max-w-[200px] mt-2 transition-colors duration-700 ${phoenixMode ? 'bg-gradient-to-r from-transparent via-amber-600 to-transparent shadow-[0_0_10px_#f59e0b]' : 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent'}`}></div>
            <p className="text-slate-200 text-xs mt-2 tracking-[0.3em] uppercase">
                {phoenixMode ? "WARNING: UNRESTRICTED ACCESS" : "Enterprise Network Visualization"}
            </p>
        </div>

        {/* Right HUD: Security - MOVED DOWN ("Anschmiegen") */}
        <div className="flex flex-col gap-2 w-56 items-end text-right hidden md:flex mr-4 mt-80">
             {/* Small connecting line from Phoenix to this box to visually link them */}
             <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/10 mb-2 mr-6"></div>

            <TechBox className="p-5 w-full border-white/20">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-[9px] tracking-widest text-slate-200 uppercase">Packet Flow</div>
                    <div className={`w-1.5 h-1.5 rounded-full ${phoenixMode ? 'bg-amber-500' : 'bg-green-400'} animate-pulse`}></div>
                </div>
                
                <div className={`text-3xl font-light ${themeColor} font-mono mb-1`}>{packetFlow.toFixed(1)} <span className="text-sm text-slate-300">M/s</span></div>
                
                <div className="flex gap-1 justify-end mt-3">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className={`w-0.5 h-3 ${i < packetFlow ? (phoenixMode ? 'bg-amber-500' : 'bg-cyan-400') : 'bg-slate-700'} transition-all duration-300`}></div>
                    ))}
                </div>
            </TechBox>
             <div className="text-[9px] text-slate-300 font-mono tracking-[0.2em] mt-1 uppercase w-full text-right border-t border-white/20 pt-1">
                Security: {phoenixMode ? <span className="text-red-500 animate-pulse">BYPASSED</span> : <span className="text-emerald-500">ENCRYPTED</span>}
             </div>
        </div>
      </div>

      {/* --- SELECTED LOCATION CARD --- */}
      <div className={`absolute top-32 left-8 w-80 pointer-events-auto transition-all duration-500 ease-out transform z-20 ${selectedLocation ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
        {selectedLocation && (
          <TechBox className={`p-6 border-l-2 ${phoenixMode ? 'border-l-amber-500' : 'border-l-cyan-500'}`}>
            <h2 className={`text-3xl font-bold ${themeColor} leading-none mb-4 uppercase`}>
                {selectedLocation.name}
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="group">
                <span className="text-slate-300 text-[10px] uppercase tracking-widest block">Leader</span>
                <span className="text-white font-medium text-lg">{selectedLocation.ceo}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-300 text-[10px] uppercase tracking-widest block">HQ</span>
                    <span className="text-slate-100">{selectedLocation.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 text-[10px] uppercase tracking-widest block">Data Value</span>
                    <span className={`font-mono text-lg ${themeColor}`}>{selectedLocation.data_value}%</span>
                  </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex justify-between items-center text-[10px] text-slate-300 font-mono tracking-wider">
                 <span>{selectedLocation.lat.toFixed(2)}, {selectedLocation.lon.toFixed(2)}</span>
                 <span className={`${themeColor} animate-pulse`}>● LIVE</span>
              </div>
            </div>
          </TechBox>
        )}
      </div>
      
      {/* --- AUDIO REACTOR (CENTER BOTTOM) --- */}
      <div className="pointer-events-auto">
          <AudioReactor phoenixMode={phoenixMode} onFlash={onFlash} />
      </div>

      {/* --- FOOTER / CONTROLS --- */}
      <div className="flex justify-between items-end w-full pointer-events-auto z-10">
        
        {/* Directory Button & List */}
        <div className="flex flex-col items-start gap-2 relative">
           <div className={`absolute bottom-14 left-0 transition-all duration-500 ease-out origin-bottom-left ${isListOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
             <TechBox className="w-72 max-h-64 overflow-y-auto scrollbar-hide bg-slate-900/95">
               <table className="w-full text-left text-xs">
                 <thead className="sticky top-0 bg-slate-900/95 z-10 border-b border-white/20">
                   <tr className="text-slate-300">
                     <th className="py-2 pl-4 font-normal uppercase tracking-wider">Entity</th>
                     <th className="py-2 pr-4 font-normal uppercase tracking-wider text-right">Loc</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/10">
                   {locations.map((loc, i) => (
                     <tr 
                      key={i} 
                      className={`cursor-pointer transition-colors hover:bg-white/10 ${selectedLocation?.name === loc.name ? 'bg-white/10' : ''}`}
                      onClick={() => onSelectLocation(loc)}
                     >
                       <td className={`py-2 pl-4 font-medium ${selectedLocation?.name === loc.name ? themeColor : 'text-slate-100'}`}>
                         {loc.name}
                       </td>
                       <td className="py-2 pr-4 text-right text-slate-300">
                         {loc.city}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </TechBox>
           </div>

           <button 
             onClick={() => setIsListOpen(!isListOpen)}
             className={`px-6 py-2 bg-slate-800 border ${borderColor} text-white hover:text-white hover:bg-slate-700 transition-all uppercase tracking-widest text-xs font-bold flex items-center gap-3 backdrop-blur-md shadow-lg`}
           >
             <span className={`w-2 h-2 ${isListOpen ? (phoenixMode ? 'bg-amber-500' : 'bg-cyan-400') : 'bg-slate-400'}`}></span>
             {isListOpen ? 'CLOSE DATA STREAM' : 'ACCESS DATA STREAM'}
           </button>
        </div>

        <div className="w-1"></div> 
      </div>

    </div>
  );
};