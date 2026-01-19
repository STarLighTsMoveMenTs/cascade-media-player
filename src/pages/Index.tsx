import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [inputCode, setInputCode] = useState("");
  const [activeLayer, setActiveLayer] = useState<"numbers" | "letters">("numbers");
  const navigate = useNavigate();

  const correctCode = "1337LEET";

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  const handleKeyPress = (key: string) => {
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
    if (inputCode.toUpperCase() === correctCode) {
      navigate("/backside");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Left Video */}
      <div className="absolute left-0 top-0 w-1/4 h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/side-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Right Video (mirrored) */}
      <div className="absolute right-0 top-0 w-1/4 h-full transform scale-x-[-1]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/side-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Center Video */}
      <div className="absolute left-1/4 top-0 w-1/2 h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/center-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Transparent Code Panel */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-transparent border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
          {/* Code Display */}
          <div className="mb-4">
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
          <div className="flex justify-center gap-2 mb-3">
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="mt-4 w-full py-2 rounded bg-cyan-500/10 border border-cyan-400/40 text-cyan-200 text-sm font-mono tracking-wider hover:bg-cyan-500/20 transition-all"
          >
            ENTER
          </button>

          {/* Navigation Hint */}
          <div className="mt-2 text-center text-cyan-400/40 text-[10px] font-mono">
            Code: 1337LEET
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
