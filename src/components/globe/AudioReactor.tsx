import React, { useEffect, useRef, useState } from 'react';

// Define window.SC type loosely for TS to access the Widget API
declare global {
  interface Window {
    SC: any;
  }
}

interface AudioReactorProps {
    phoenixMode: boolean;
    onFlash?: (type: 'single' | 'double' | 'soft') => void;
}

export const AudioReactor: React.FC<AudioReactorProps> = ({ phoenixMode, onFlash }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isWidgetReady, setIsWidgetReady] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    
    // Theme colors
    const themeColor = phoenixMode ? "text-amber-500" : "text-cyan-400";
    const borderColor = phoenixMode ? "border-amber-500/60" : "border-cyan-500/60";
    // Increased glow intensity
    const glowColor = phoenixMode ? "shadow-[0_0_60px_rgba(245,158,11,0.5)]" : "shadow-[0_0_50px_rgba(34,211,238,0.3)]";
    const barColor = phoenixMode ? "#f59e0b" : "#22d3ee";

    // The Requested Track
    const trackUrl = "https://soundcloud.com/orbits-sounds/unbenannter-song-1";

    // 1. Load SC Widget API & Initialize
    useEffect(() => {
        const init = () => {
             if (iframeRef.current && window.SC) {
                const widget = window.SC.Widget(iframeRef.current);
                widgetRef.current = widget;

                widget.bind(window.SC.Widget.Events.READY, () => {
                    setIsWidgetReady(true);
                    widget.setVolume(60); 
                });

                widget.bind(window.SC.Widget.Events.PLAY, () => {
                    setIsPlaying(true);
                    // TRIGGER FLASH ON AUDIO START
                    if (onFlash) onFlash('single');
                });
                widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
                widget.bind(window.SC.Widget.Events.FINISH, () => setIsPlaying(false));
             }
        };

        if (!window.SC) {
            const script = document.createElement('script');
            script.src = "https://w.soundcloud.com/player/api.js";
            script.async = true;
            script.onload = init;
            document.body.appendChild(script);
        } else {
            init();
        }
    }, [onFlash]);

    const togglePlay = () => {
        if (!widgetRef.current || !isWidgetReady) return;
        widgetRef.current.toggle();
    };

    // 2. Procedural Visualizer (Volumetric Dual-Layer)
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Center Guide Line (Brighter)
            ctx.beginPath();
            ctx.strokeStyle = phoenixMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 211, 238, 0.15)';
            ctx.lineWidth = 1;
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            const time = Date.now() / 1000;
            
            // "Phantom Sync" Algorithm
            const beatCycle = (Math.sin(time * Math.PI * 4) + 1) / 2; // 0 to 1
            const kick = Math.pow(beatCycle, 4); // Sharp spikes for "Kick"
            
            // Increased Amplitude
            const baseAmp = isPlaying ? 15 : 2; 
            const dynamicAmp = isPlaying ? (baseAmp + (kick * 30)) : 2; // Higher spikes

            // --- LAYER 1: ATMOSPHERE (Wide, Soft, Glowy) ---
            ctx.beginPath();
            ctx.lineWidth = 5; // Wide path
            ctx.strokeStyle = barColor;
            ctx.shadowBlur = 20; 
            ctx.shadowColor = barColor;
            ctx.globalAlpha = 0.5; // Slightly more visible
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let x = 0; x < canvas.width; x++) {
                const nx = (x / canvas.width) * 2 - 1; 
                const taper = Math.pow(1 - Math.abs(nx), 2); 

                const w1 = Math.sin(x * 0.03 + time * 4); 
                const w2 = Math.sin(x * 0.1 - time * 8) * 0.3; 
                const jitter = (Math.random() - 0.5) * (kick * 6); 
                
                // Add a small offset to the glow for volume
                const y = canvas.height / 2 + (w1 + w2) * dynamicAmp * taper + jitter * taper;
                
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0; // Reset Alpha

            // --- LAYER 2: CORE (Thin, Sharp, Hot) ---
            ctx.beginPath();
            ctx.lineWidth = 1.5; // Thin core
            ctx.strokeStyle = '#ffffff'; // White core
            ctx.shadowBlur = 0; // No blur, keep it sharp
            
            for (let x = 0; x < canvas.width; x++) {
                const nx = (x / canvas.width) * 2 - 1; 
                const taper = Math.pow(1 - Math.abs(nx), 2); 
                const w1 = Math.sin(x * 0.03 + time * 4); 
                const w2 = Math.sin(x * 0.1 - time * 8) * 0.3; 
                const jitter = (Math.random() - 0.5) * (kick * 6);
                const y = canvas.height / 2 + (w1 + w2) * dynamicAmp * taper + jitter * taper;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        draw();
        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, phoenixMode, barColor]);

    return (
        // Positioned centrally under the Earth (bottom-[10%]) to act as the base emitter
        <div className={`
            absolute bottom-[10%] left-1/2 -translate-x-1/2 
            w-[280px] md:w-[320px] h-[80px]
            bg-slate-900/80 backdrop-blur-md
            border-x border-b ${borderColor} border-t-0
            ${glowColor}
            flex flex-col items-center justify-center
            transition-all duration-700
            z-40
            group
            animate-wave-breath
        `}>
            {/* Top Border - Energy Emitter Edge */}
            <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${phoenixMode ? 'via-amber-500' : 'via-cyan-400'} to-transparent opacity-100`}></div>

            {/* Emitter Glow Point (Visual Anchor for Prism) */}
            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-2 ${phoenixMode ? 'bg-amber-500/30' : 'bg-cyan-400/30'} blur-md`}></div>

            {/* Hidden SoundCloud Iframe */}
            <iframe
                ref={iframeRef}
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                title="Hidden SC Player"
                style={{ visibility: 'hidden', position: 'absolute' }}
            ></iframe>

            {/* Visualizer Canvas */}
            <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>
                <canvas 
                    ref={canvasRef} 
                    width={320} 
                    height={80} 
                    className="w-full h-full mix-blend-screen opacity-100" 
                />
                
                {/* Minimal Label Overlay - BRIGHTER TEXT */}
                <div className="absolute bottom-1 left-0 w-full text-center pointer-events-none">
                     <span className={`text-[9px] tracking-[0.4em] uppercase font-mono ${themeColor} opacity-90 drop-shadow-md`}>
                        {isPlaying ? (phoenixMode ? "CORE CRITICAL" : "SYSTEM ONLINE") : "AUDIO LINK"}
                     </span>
                </div>

                {/* Hover Play Button Hint */}
                {!isPlaying && isWidgetReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        <div className={`w-8 h-8 rounded-full border ${borderColor} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <svg className={`w-3 h-3 ${themeColor}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Corners - Brighter */}
            <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 bg-current ${themeColor}`}></div>
            <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 bg-current ${themeColor}`}></div>
            <div className={`absolute top-0 left-0 w-px h-3 bg-current ${themeColor}`}></div>
            <div className={`absolute top-0 right-0 w-px h-3 bg-current ${themeColor}`}></div>

        </div>
    );
};