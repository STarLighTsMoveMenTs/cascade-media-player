import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [inputCode, setInputCode] = useState("");
  const [activeLayer, setActiveLayer] = useState<"numbers" | "letters">("numbers");
  const [attempts, setAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

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
      navigate("/backside");
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
        <div className="absolute left-0 top-0 w-[28%] h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/side-video.mp4" type="video/mp4" />
          </video>
          {/* Right edge fade */}
          <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Right Video (mirrored) */}
        <div className="absolute right-0 top-0 w-[28%] h-full transform scale-x-[-1]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/side-video.mp4" type="video/mp4" />
          </video>
          {/* Left edge fade (appears on right due to mirror) */}
          <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Center Video */}
        <div className="absolute left-[22%] top-0 w-[56%] h-full">
          {/* Left edge blend */}
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10 pointer-events-none" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/center-video.mp4" type="video/mp4" />
          </video>
          {/* Right edge blend */}
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-black/70 via-black/30 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {/* Layer 2: Code Password Panel */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="bg-transparent border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
          
          {/* Attempts Counter */}
          <div className="mb-3 text-center">
            <span className={`font-mono text-xs ${attempts <= 1 ? 'text-red-400' : 'text-cyan-400/60'}`}>
              Versuche: {attempts}/3
            </span>
          </div>

          {isLocked ? (
            <div className="text-center py-8">
              <div className="text-red-400 font-mono text-lg mb-2">GESPERRT</div>
              <div className="text-red-400/60 font-mono text-xs">Keine Versuche mehr</div>
            </div>
          ) : (
            <>
              {/* Acoustic Fields */}
              <div className="mb-4">
                <div className="text-center mb-2">
                  <span className="text-cyan-400/60 text-[10px] font-mono">
                    {patternComplete ? "✓ Muster korrekt" : "Akustik-Muster wiederholen"}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {acousticFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => handleAcousticPress(field)}
                      disabled={isPlayingPattern || patternComplete}
                      className={`w-8 h-8 rounded transition-all duration-200 ${
                        activeField === field
                          ? `bg-gradient-to-br ${fieldColors[field]} shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-110`
                          : patternComplete
                            ? 'bg-green-500/20 border border-green-400/40'
                            : 'bg-black/20 border border-cyan-400/30 hover:border-cyan-400/60'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={playPattern}
                  disabled={isPlayingPattern || patternComplete}
                  className="w-full py-1 text-[10px] font-mono text-cyan-400/80 border border-cyan-400/30 rounded hover:border-cyan-400/60 transition-all disabled:opacity-50"
                >
                  {isPlayingPattern ? "..." : "▶ Muster abspielen"}
                </button>
              </div>

              {/* Code Display */}
              <div className={`mb-4 transition-opacity ${patternComplete ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="bg-black/20 border border-cyan-400/40 rounded px-4 py-2 text-center">
                  <span className="text-cyan-400 text-xs tracking-wider font-mono">Enter Code</span>
                </div>
                <div className="mt-2 bg-black/20 border border-cyan-400/40 rounded px-4 py-2 text-center min-w-[160px]">
                  <span className="text-cyan-300 text-lg font-mono tracking-[0.2em]">
                    {inputCode || "________"}
                  </span>
                </div>
              </div>

              {/* Layer Toggle */}
              <div className={`flex justify-center gap-2 mb-3 transition-opacity ${patternComplete ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <button
                  onClick={() => setActiveLayer("numbers")}
                  className={`px-3 py-1 rounded font-mono text-xs transition-all ${
                    activeLayer === "numbers"
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/60"
                      : "bg-transparent text-cyan-400/60 border border-cyan-400/20 hover:border-cyan-400/40"
                  }`}
                >
                  1-9
                </button>
                <button
                  onClick={() => setActiveLayer("letters")}
                  className={`px-3 py-1 rounded font-mono text-xs transition-all ${
                    activeLayer === "letters"
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/60"
                      : "bg-transparent text-cyan-400/60 border border-cyan-400/20 hover:border-cyan-400/40"
                  }`}
                >
                  A-Z
                </button>
              </div>

              {/* Keypad */}
              <div className={`transition-opacity ${patternComplete ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                {activeLayer === "numbers" ? (
                  <div className="grid grid-cols-3 gap-2">
                    {numbers.slice(0, 9).map((num) => (
                      <button
                        key={num}
                        onClick={() => handleKeyPress(num)}
                        className="w-10 h-10 rounded-full border border-cyan-400/40 bg-transparent text-cyan-300 text-base font-mono hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={handleClear}
                      className="w-10 h-10 rounded-full border border-red-400/40 bg-transparent text-red-400 text-xs font-mono hover:bg-red-500/20 hover:border-red-400/60 transition-all"
                    >
                      CLR
                    </button>
                    <button
                      onClick={() => handleKeyPress("0")}
                      className="w-10 h-10 rounded-full border border-cyan-400/40 bg-transparent text-cyan-300 text-base font-mono hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all"
                    >
                      0
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="w-10 h-10 rounded-full border border-yellow-400/40 bg-transparent text-yellow-400 text-sm font-mono hover:bg-yellow-500/20 hover:border-yellow-400/60 transition-all"
                    >
                      ←
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {letters.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => handleKeyPress(letter)}
                        className="w-7 h-7 rounded border border-cyan-400/40 bg-transparent text-cyan-300 text-xs font-mono hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all"
                      >
                        {letter}
                      </button>
                    ))}
                    <button
                      onClick={handleClear}
                      className="w-7 h-7 rounded border border-red-400/40 bg-transparent text-red-400 text-[10px] font-mono hover:bg-red-500/20 hover:border-red-400/60 transition-all"
                    >
                      CLR
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="w-7 h-7 rounded border border-yellow-400/40 bg-transparent text-yellow-400 text-xs font-mono hover:bg-yellow-500/20 hover:border-yellow-400/60 transition-all"
                    >
                      ←
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!patternComplete}
                className="mt-4 w-full py-2 rounded bg-cyan-500/10 border border-cyan-400/40 text-cyan-200 text-sm font-mono tracking-wider hover:bg-cyan-500/20 transition-all disabled:opacity-30"
              >
                ENTER
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
