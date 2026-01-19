import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { HologramScene, LocationData } from '@/components/globe/HologramScene';
import { UIOverlay } from '@/components/globe/UIOverlay';
import { ChatAssistant } from '@/components/globe/ChatAssistant';
import { TribunalSigil } from '@/components/globe/TribunalSigil';
import { CodeAgentPanel } from '@/components/globe/CodeAgentPanel';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

const Globe: React.FC = () => {
  const navigate = useNavigate();
  const [zoomIn, setZoomIn] = useState(true);

  useEffect(() => {
    // Trigger zoom-in animation on mount
    setTimeout(() => setZoomIn(false), 100);
  }, []);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [phoenixMode, setPhoenixMode] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  
  // --- CINEMATIC STATE ---
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [cameraFocus, setCameraFocus] = useState<THREE.Vector3 | null>(null);
  const [systemEvent, setSystemEvent] = useState<string | null>(null);

  // --- LIGHTNING SYSTEM ---
  const flashRef = useRef<HTMLDivElement>(null);

  const triggerFlash = useCallback((type: 'single' | 'double' | 'soft') => {
    const el = flashRef.current;
    if (!el) return;

    // Reset
    el.style.transition = 'none';
    el.style.opacity = '0';
    
    // Force Reflow
    void el.offsetWidth;

    if (type === 'double') {
        // Impact 1
        el.style.transition = 'opacity 50ms ease-out';
        el.style.opacity = '0.8'; // Bright
        setTimeout(() => {
            el.style.opacity = '0';
            // Impact 2 (delayed)
            setTimeout(() => {
               el.style.opacity = '1'; // Max Brightness
               setTimeout(() => {
                   el.style.transition = 'opacity 300ms ease-out';
                   el.style.opacity = '0';
               }, 100);
            }, 120);
        }, 80);
    } else if (type === 'single') {
        el.style.transition = 'opacity 50ms ease-out';
        el.style.opacity = '0.6';
        setTimeout(() => {
            el.style.transition = 'opacity 250ms ease-out';
            el.style.opacity = '0';
        }, 100);
    } else if (type === 'soft') {
        el.style.transition = 'opacity 500ms ease-in-out';
        el.style.opacity = '0.15';
        setTimeout(() => {
            el.style.opacity = '0';
        }, 600);
    }
  }, []);

  const handleInitTools = useCallback(() => {
      // Create unique event ID to trigger effect
      setSystemEvent(`init-tools-${Date.now()}`);
      triggerFlash('single');
  }, [triggerFlash]);

  return (
    <div className={`transition-all duration-2000 ${zoomIn ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-[100] bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-4 py-2 rounded-lg backdrop-blur-sm border border-cyan-500/30 transition-all"
      >
        ← Back to Login
      </button>

      <div className="relative w-full h-screen bg-[#050005] overflow-hidden">
        
        {/* --- LIGHTNING OVERLAY (Cinematic Flash) --- */}
        <div 
          ref={flashRef}
          id="lightning"
          className="fixed inset-0 bg-white z-[9999] pointer-events-none opacity-0 mix-blend-screen"
        ></div>

        {/* --- CINEMA VIGNETTE (Depth & Focus) - BRIGHTER VERSION --- */}
        <div 
          className="absolute inset-0 pointer-events-none z-[90]"
          style={{
            // Reduced intensity to allow more brightness, especially at edges
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0.5) 100%)'
          }}
        ></div>

        {/* --- COLOR GRADING OVERLAY --- */}
        <div className="absolute inset-0 pointer-events-none z-[5] mix-blend-overlay opacity-30"
             style={{
               background: 'radial-gradient(circle at center, rgba(0, 180, 255, 0.1) 0%, rgba(0, 0, 0, 0.6) 90%)'
             }}
        ></div>
        
        {/* Background Ambience Shift */}
        <div className={`absolute inset-0 transition-colors duration-1000 pointer-events-none z-0 ${phoenixMode ? 'bg-red-950/20' : 'bg-transparent'}`}></div>

        <UIOverlay 
          selectedLocation={selectedLocation} 
          onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              setCameraFocus(null); 
          }}
          phoenixMode={phoenixMode}
          setPhoenixMode={(active) => {
              setPhoenixMode(active);
              // TRIGGER DOUBLE FLASH ON MODE CHANGE
              triggerFlash('double');
          }}
          onFlash={triggerFlash}
          onInitTools={handleInitTools}
        />
        
        <ChatAssistant 
          onAIStateChange={setIsAIProcessing}
          setCameraFocus={setCameraFocus}
          onFlash={triggerFlash}
          systemEvent={systemEvent}
        />

        <CodeAgentPanel />
        
        <TribunalSigil isActive={isAIProcessing} />
        
        {/* Neujahrsgruß Stern über dem Globe */}
        <button
          onClick={() => setShowGreeting(!showGreeting)}
          className="absolute top-[15%] left-1/2 -translate-x-1/2 z-50 cursor-pointer group"
          title="Neujahrsgrüße 2026"
        >
          <div className="relative w-16 h-16">
            {/* Outer Glow */}
            <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-2xl animate-pulse" />
            
            {/* Star Shape */}
            <svg className="w-16 h-16 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="starGlow">
                  <stop offset="0%" stopColor="#ff8c00" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#ff4500" stopOpacity="0.8"/>
                </radialGradient>
              </defs>
              <polygon 
                points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" 
                fill="url(#starGlow)" 
                className="drop-shadow-[0_0_20px_rgba(255,140,0,1)]"
              />
            </svg>
            
            {/* Sparkle Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-2xl font-bold animate-pulse">✨</div>
            </div>
          </div>
        </button>

        {/* Neujahrsgruß Overlay */}
        {showGreeting && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowGreeting(false)}
          >
            <div 
              className="w-[80%] h-[90%] bg-slate-900 rounded-3xl border-4 border-orange-400 shadow-[0_0_60px_rgba(255,140,0,0.8)] animate-slide-in-top overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 bg-slate-800 border-b-2 border-orange-400">
                <h3 className="text-orange-200 text-xl font-bold drop-shadow-[0_0_10px_rgba(255,140,0,1)]">✨ Neujahrsgrüße 2026 ✨</h3>
                <button
                  onClick={() => setShowGreeting(false)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
                >
                  ✕
                </button>
              </div>
              <iframe
                src="/PitchDeck&Info-Page/Neujahrsgrüße 2026 - Orange Edition.html"
                className="w-full h-[calc(100%-64px)]"
                title="Neujahrsgrüße 2026"
              />
            </div>
          </div>
        )}
        
        <Canvas
          camera={{ position: [0, 0, 18], fov: 60 }}
          gl={{ antialias: true }}
          dpr={window.devicePixelRatio}
        >
          <HologramScene 
            onSelect={setSelectedLocation} 
            selectedLocation={selectedLocation} 
            phoenixMode={phoenixMode}
            externalCameraFocus={cameraFocus}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Globe;