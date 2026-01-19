import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [inputCode, setInputCode] = useState("");
  const [activeLayer, setActiveLayer] = useState<"numbers" | "letters">("numbers");
  const [attempts, setAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [showAccessGranted, setShowAccessGranted] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<"left" | "right" | null>(null);
  const navigate = useNavigate();

  // Video refs for seamless looping
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const centerVideoRef = useRef<HTMLVideoElement>(null);

  // Acoustic Pattern State
  const [acousticPattern, setAcousticPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [activeField, setActiveField] = useState<number | null>(null);
  const [isPlayingPattern, setIsPlayingPattern] = useState(false);
  const [patternComplete, setPatternComplete] = useState(false);

  const correctCode = "1337LEET";
  const patternLength = 4;

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  // Generate random pattern on mount
  useEffect(() => {
    generatePattern();
  }, []);

  // Setup seamless video looping with precise restart
  useEffect(() => {
    const setupSeamlessLoop = (video: HTMLVideoElement | null) => {
      if (!video) return;

      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch(err => console.log('Video play error:', err));
      };

      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    };

    const cleanup1 = setupSeamlessLoop(leftVideoRef.current);
    const cleanup2 = setupSeamlessLoop(rightVideoRef.current);
    const cleanup3 = setupSeamlessLoop(centerVideoRef.current);

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
    };
  }, []);

  const generatePattern = () => {
    const newPattern = Array.from({ length: patternLength }, () => Math.floor(Math.random() * 6));
    setAcousticPattern(newPattern);
    setUserPattern([]);
    setPatternComplete(false);
  };

  // Play the acoustic pattern
  const playPattern = useCallback(async () => {
    if (isPlayingPattern) return;
    setIsPlayingPattern(true);
    
    for (let i = 0; i < acousticPattern.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveField(acousticPattern[i]);
      // Play sound
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gainNode = audio.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audio.destination);
      oscillator.frequency.value = 300 + (acousticPattern[i] * 100);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audio.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3);
      oscillator.start(audio.currentTime);
      oscillator.stop(audio.currentTime + 0.3);
      await new Promise(resolve => setTimeout(resolve, 300));
      setActiveField(null);
    }
    
    setIsPlayingPattern(false);
  }, [acousticPattern, isPlayingPattern]);

  // Handle acoustic field press
  const handleAcousticPress = (index: number) => {
    if (isPlayingPattern || patternComplete || isLocked) return;

    // Light up and play sound
    setActiveField(index);
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.frequency.value = 300 + (index * 100);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audio.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3);
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + 0.3);

    setTimeout(() => setActiveField(null), 200);

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if pattern matches so far
    const isCorrectSoFar = newUserPattern.every((val, idx) => val === acousticPattern[idx]);
    
    if (!isCorrectSoFar) {
      // Wrong pattern
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      setUserPattern([]);
      
      if (newAttempts <= 0) {
        setIsLocked(true);
      } else {
        // Regenerate pattern after wrong attempt
        setTimeout(() => generatePattern(), 500);
      }
    } else if (newUserPattern.length === acousticPattern.length) {
      // Pattern complete!
      setPatternComplete(true);
    }
  };

  const handleKeyPress = (key: string) => {
    if (isLocked || !patternComplete) return;
    if (inputCode.length < 8) {
      setInputCode((prev) => prev + key);
    }
  };

  const handleClear = () => {
    setInputCode("");
  };

  const handleBackspace = () => {
    setInputCode((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (isLocked || !patternComplete) return;
    
    if (inputCode.toUpperCase() === correctCode) {
      // Play success sound
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Success chord
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Show ACCESS GRANTED animation
      setShowAccessGranted(true);
      
      // Navigate after animation
      setTimeout(() => {
        navigate("/globe");
      }, 2000);
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      setInputCode("");
      
      if (newAttempts <= 0) {
        setIsLocked(true);
      }
    }
  };

  const acousticFields = [0, 1, 2, 3, 4, 5];
  const fieldColors = [
    "from-red-500 to-red-600",
    "from-orange-500 to-orange-600", 
    "from-yellow-500 to-yellow-600",
    "from-green-500 to-green-600",
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600"
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Layer 1: Videos */}
      <div className="absolute inset-0 z-0">
        {/* Left Video */}
        <div className="absolute left-0 top-0 w-[33%] h-full z-20">
          <video
            ref={leftVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/side-video.mp4" type="video/mp4" />
          </video>
          
          {/* Kobold with Sparkles */}
          <div className="absolute top-4 left-4 flex flex-col items-center gap-2 z-50">
            {/* Top Sparkle (Phoenix Grid) */}
            <button
              onClick={() => setActiveOverlay(activeOverlay === "left" ? null : "left")}
              className="text-3xl transition-all duration-300 hover:scale-125 cursor-pointer animate-pulse drop-shadow-[0_0_15px_rgba(0,255,255,1),0_0_30px_rgba(0,255,255,0.8)]"
              title="Phoenix Grid Platform"
            >
              ✨
            </button>
            
            {/* Kobold Image */}
            <div className="animate-bounce drop-shadow-[0_0_15px_rgba(0,255,255,1),0_0_30px_rgba(0,255,255,0.8)]">
              <img 
                src="/PitchDeck&Info-Page/Honor of EU-KOMMISSION Team Frau. Leyen/EU.CORP Projekte/Bilder Kobold/Kobold.png" 
                alt="Kobold"
                className="w-9 h-9 object-contain"
              />
            </div>
            
            {/* Bottom Sparkle (Peace Diplomacy) */}
            <button
              onClick={() => setActiveOverlay(activeOverlay === "right" ? null : "right")}
              className="text-3xl transition-all duration-300 hover:scale-125 cursor-pointer animate-pulse drop-shadow-[0_0_15px_rgba(0,255,255,1),0_0_30px_rgba(0,255,255,0.8)]"
              title="Peace Diplomacy Technology"
            >
              ✨
            </button>
          </div>
        </div>

        {/* Right Video (mirrored) */}
        <div className="absolute right-0 top-0 w-[33%] h-full transform scale-x-[-1] z-20">
          <video
            ref={rightVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/side-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Center Video */}
        <div className="absolute left-[18%] top-0 w-[64%] h-full z-10">
          <video
            ref={centerVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/center-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Layer 2: Code Password Panel */}
      <div className="absolute left-[33%] right-[33%] top-0 bottom-0 z-10 flex items-center justify-center mt-[2cm]">
        <div className="bg-transparent border-[4px] border-cyan-200 rounded-[3rem] p-8 shadow-[0_0_60px_rgba(0,255,255,1),0_0_30px_rgba(0,255,255,0.8),inset_0_0_20px_rgba(0,255,255,0.2)] animate-pulse-slow relative overflow-hidden w-full max-w-2xl">
          
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan" />
          </div>
          
          {/* Attempts Counter */}
          <div className="mb-5 text-center relative">
            <span className={`font-mono text-lg tracking-wider font-bold drop-shadow-[0_0_15px_rgba(0,255,255,1),0_0_30px_rgba(0,255,255,0.8)] ${attempts <= 1 ? 'text-red-200 animate-glitch drop-shadow-[0_0_15px_rgba(255,0,0,1)]' : 'text-white'}`}>
              [ VERSUCHE: {attempts}/3 ]
            </span>
          </div>

          {isLocked ? (
            <div className="text-center py-8">
              <div className="text-red-400 font-mono text-2xl mb-3 animate-glitch font-bold">⚠ GESPERRT ⚠</div>
              <div className="text-red-400/80 font-mono text-base animate-pulse">SYSTEM LOCKED</div>
              <div className="text-red-400/60 font-mono text-xl mt-3">:(</div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-8">
              {/* Left Column: Acoustic Fields */}
              <div className="flex flex-col justify-center">
                <div className="text-center mb-4">
                  <span className={`text-sm font-mono tracking-wider font-extrabold ${
                    patternComplete ? 'text-green-200 animate-pulse drop-shadow-[0_0_15px_rgba(0,255,0,1),0_0_30px_rgba(0,255,0,0.8)]' : 'text-white drop-shadow-[0_0_12px_rgba(0,255,255,1),0_0_25px_rgba(0,255,255,0.8)]'
                  }`}>
                    {patternComplete ? "✓ ERKANNT" : "[ SCHRITT 1: AKUSTIK ]"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {acousticFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => handleAcousticPress(field)}
                      disabled={isPlayingPattern || patternComplete}
                      className={`w-10 h-10 rounded transition-all duration-200 ${
                        activeField === field
                          ? `bg-gradient-to-br ${fieldColors[field]} shadow-[0_0_20px_rgba(255,255,255,0.7)] scale-110`
                          : patternComplete
                            ? 'bg-green-500/30 border-2 border-green-400/50'
                            : 'bg-black/30 border-2 border-cyan-400/40 hover:border-cyan-400/70'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={playPattern}
                  disabled={isPlayingPattern || patternComplete}
                  className="w-full py-2.5 text-sm font-mono text-white font-bold border-[4px] border-cyan-200 rounded-lg bg-cyan-500/25 hover:bg-cyan-400/40 hover:border-white hover:shadow-[0_0_40px_rgba(0,255,255,1),0_0_20px_rgba(0,255,255,1),inset_0_0_15px_rgba(0,255,255,0.3)] transition-all disabled:opacity-30 animate-pulse-slow shadow-[0_0_25px_rgba(0,255,255,0.8),0_0_50px_rgba(0,255,255,0.5)] drop-shadow-[0_0_10px_rgba(0,255,255,1)]"
                >
                  {isPlayingPattern ? "..." : "▶ ABSPIELEN"}
                </button>
              </div>

              {/* Center Column: Code Display */}
              <div className="flex flex-col justify-center min-w-[240px]">
                <div className={`transition-all duration-500 ${patternComplete ? 'opacity-100 scale-100' : 'opacity-20 pointer-events-none scale-95'}`}>
                  <div className="bg-transparent border-[4px] border-cyan-200 rounded-lg px-4 py-2.5 text-center relative overflow-hidden mb-4 shadow-[0_0_30px_rgba(0,255,255,0.8),0_0_15px_rgba(0,255,255,1)]">
                    <span className="text-white text-base tracking-widest font-mono font-extrabold drop-shadow-[0_0_12px_rgba(0,255,255,1),0_0_25px_rgba(0,255,255,0.8)]">[ SCHRITT 2: CODE ]</span>
                    <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
                  </div>
                  <div className="bg-transparent border-[4px] border-cyan-200 rounded-lg px-5 py-4 text-center relative overflow-hidden shadow-[0_0_40px_rgba(0,255,255,1),0_0_20px_rgba(0,255,255,1),inset_0_0_15px_rgba(0,255,255,0.2)] mb-4">
                    <span className="text-white text-3xl font-mono tracking-[0.35em] drop-shadow-[0_0_20px_rgba(0,255,255,1),0_0_40px_rgba(0,255,255,1),0_0_60px_rgba(0,255,255,0.6)] font-extrabold">
                      {inputCode || "________"}
                    </span>
                    {inputCode && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-5 bg-white animate-pulse shadow-[0_0_20px_rgba(0,255,255,1),0_0_40px_rgba(0,255,255,0.8)]" />}
                  </div>
                  
                  {/* Layer Toggle */}
                  <div className="flex justify-center gap-3 mb-4">
                    <button
                      onClick={() => setActiveLayer("numbers")}
                      className={`px-5 py-2 rounded-lg font-mono text-base transition-all font-bold ${
                        activeLayer === "numbers"
                          ? "bg-cyan-500/30 text-white border-[4px] border-cyan-200 shadow-[0_0_30px_rgba(0,255,255,1),0_0_15px_rgba(0,255,255,1),inset_0_0_10px_rgba(0,255,255,0.3)] scale-105 drop-shadow-[0_0_10px_rgba(0,255,255,1)]"
                          : "bg-transparent text-cyan-200 border-[3px] border-cyan-400/50 hover:border-cyan-200 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                      }`}
                    >
                      1-9
                    </button>
                    <button
                      onClick={() => setActiveLayer("letters")}
                      className={`px-5 py-2 rounded-lg font-mono text-base transition-all font-bold ${
                        activeLayer === "letters"
                          ? "bg-cyan-500/30 text-white border-[4px] border-cyan-200 shadow-[0_0_30px_rgba(0,255,255,1),0_0_15px_rgba(0,255,255,1),inset_0_0_10px_rgba(0,255,255,0.3)] scale-105 drop-shadow-[0_0_10px_rgba(0,255,255,1)]"
                          : "bg-transparent text-cyan-200 border-[3px] border-cyan-400/50 hover:border-cyan-200 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                      }`}
                    >
                      A-Z
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Keypad */}
              <div className={`flex flex-col justify-center transition-opacity ${patternComplete ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                {activeLayer === "numbers" ? (
                  <div className="grid grid-cols-3 gap-2.5">
                    {numbers.slice(0, 9).map((num, index) => (
                      <button
                        key={num}
                        onClick={() => handleKeyPress(num)}
                        className={`w-12 h-12 rounded-lg border-2 border-cyan-400/50 bg-black/30 text-cyan-300 text-base font-mono font-semibold hover:bg-cyan-500/20 hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all animate-float-delay-${(index % 8) + 1}`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={handleClear}
                      className="w-12 h-12 rounded-lg border-2 border-red-400/50 bg-black/30 text-red-400 text-sm font-mono font-semibold hover:bg-red-500/20 hover:border-red-400/80 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all animate-float"
                    >
                      CLR
                    </button>
                    <button
                      onClick={() => handleKeyPress("0")}
                      className="w-12 h-12 rounded-lg border-2 border-cyan-400/50 bg-black/30 text-cyan-300 text-base font-mono font-semibold hover:bg-cyan-500/20 hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all animate-float-delay-1"
                    >
                      0
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="w-12 h-12 rounded-lg border-2 border-yellow-400/50 bg-black/30 text-yellow-400 text-lg font-mono font-semibold hover:bg-yellow-500/20 hover:border-yellow-400/80 hover:shadow-[0_0_15px_rgba(255,255,0,0.4)] transition-all animate-float-delay-2"
                    >
                      ←
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {letters.map((letter, index) => (
                      <button
                        key={letter}
                        onClick={() => handleKeyPress(letter)}
                        className={`w-8 h-8 rounded border-2 border-cyan-400/50 bg-black/30 text-cyan-300 text-sm font-mono font-semibold hover:bg-cyan-500/20 hover:border-cyan-400/80 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all animate-float-delay-${(index % 8) + 1}`}
                      >
                        {letter}
                      </button>
                    ))}
                    <button
                      onClick={handleClear}
                      className="w-8 h-8 rounded border-2 border-red-400/50 bg-black/30 text-red-400 text-xs font-mono font-semibold hover:bg-red-500/20 hover:border-red-400/80 transition-all animate-float"
                    >
                      C
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="w-8 h-8 rounded border-2 border-yellow-400/50 bg-black/30 text-yellow-400 text-sm font-mono font-semibold hover:bg-yellow-500/20 hover:border-yellow-400/80 transition-all animate-float-delay-1"
                    >
                      ←
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button - Full Width at Bottom */}
          {!isLocked && (
            <button
              onClick={handleSubmit}
              disabled={!patternComplete}
              className="mt-8 w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500/35 to-blue-500/35 border-[5px] border-cyan-100 text-white text-xl font-mono tracking-widest font-extrabold hover:from-cyan-400/50 hover:to-blue-400/50 hover:border-white hover:shadow-[0_0_60px_rgba(0,255,255,1),0_0_30px_rgba(0,255,255,1),0_0_90px_rgba(0,255,255,0.6),inset_0_0_25px_rgba(0,255,255,0.4)] transition-all disabled:opacity-20 disabled:scale-95 relative overflow-hidden group shadow-[0_0_50px_rgba(0,255,255,1),0_0_25px_rgba(0,255,255,1),0_0_75px_rgba(0,255,255,0.6)] animate-pulse-slow drop-shadow-[0_0_20px_rgba(0,255,255,1),0_0_40px_rgba(0,255,255,1)]"
            >
              <span className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,1)]">[ ▶ ENTER ]</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
          )}
        </div>
      </div>

      {/* Overlay Iframes */}
      {/* Left Ear - Phoenix Grid */}
      {activeOverlay === "left" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-start bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveOverlay(null)}
        >
          <div 
            className="w-[80%] h-[90%] ml-[5%] bg-slate-900 rounded-3xl border-4 border-cyan-400 shadow-[0_0_60px_rgba(0,255,255,0.8)] animate-slide-in-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 bg-slate-800 border-b-2 border-cyan-400">
              <h3 className="text-white text-xl font-bold drop-shadow-[0_0_10px_rgba(0,255,255,1)]">Phoenix Grid - 3D Intelligence Platform</h3>
              <button
                onClick={() => setActiveOverlay(null)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
              >
                ✕
              </button>
            </div>
            <iframe
              src="/PitchDeck&Info-Page/Phoenix Grid - 3D IntelligencePlatform.html"
              className="w-full h-[calc(100%-64px)]"
              title="Phoenix Grid Platform"
            />
          </div>
        </div>
      )}

      {/* Right Ear - Peace Diplomacy */}
      {activeOverlay === "right" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveOverlay(null)}
        >
          <div 
            className="w-[80%] h-[90%] mr-[5%] bg-slate-900 rounded-3xl border-4 border-cyan-400 shadow-[0_0_60px_rgba(0,255,255,0.8)] animate-slide-in-right overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 bg-slate-800 border-b-2 border-cyan-400">
              <h3 className="text-white text-xl font-bold drop-shadow-[0_0_10px_rgba(0,255,255,1)]">Peace Diplomacy & Technology</h3>
              <button
                onClick={() => setActiveOverlay(null)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
              >
                ✕
              </button>
            </div>
            <iframe
              src="/PitchDeck&Info-Page/Peace Diplomacy & Technology · EX2025D1218310 — Daniel Pohl (Smooth Glide · Fix v2).html"
              className="w-full h-[calc(100%-64px)]"
              title="Peace Diplomacy Technology"
            />
          </div>
        </div>
      )}

      {/* ACCESS GRANTED Overlay */}
      {showAccessGranted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="text-center">
            {/* Glitch Effect Container */}
            <div className="relative">
              {/* Main Text */}
              <div className="text-6xl font-mono font-extrabold text-white mb-8 animate-glitch drop-shadow-[0_0_30px_rgba(0,255,255,1),0_0_60px_rgba(0,255,255,0.8)]">
                ACCESS GRANTED
              </div>
              
              {/* Glitch Layers */}
              <div className="absolute inset-0 text-6xl font-mono font-extrabold text-cyan-400 opacity-70 animate-glitch-2" style={{clipPath: 'inset(0 0 70% 0)'}}>
                ACCESS GRANTED
              </div>
              <div className="absolute inset-0 text-6xl font-mono font-extrabold text-red-400 opacity-70 animate-glitch-3" style={{clipPath: 'inset(70% 0 0 0)'}}>
                ACCESS GRANTED
              </div>
            </div>
            
            {/* Success Icon */}
            <div className="text-8xl text-green-400 animate-pulse drop-shadow-[0_0_30px_rgba(0,255,0,1)]">
              ✓
            </div>
            
            {/* System Message */}
            <div className="mt-8 text-cyan-300 font-mono text-lg tracking-wider animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
              [ INITIALISIERE HOLOGRAPHIC INTERFACE ]
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 w-96 h-2 bg-black/50 rounded-full overflow-hidden mx-auto border border-cyan-400/50">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-progress shadow-[0_0_20px_rgba(0,255,255,0.8)]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
