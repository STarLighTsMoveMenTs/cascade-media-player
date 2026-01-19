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
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
          {/* Code Display */}
          <div className="mb-6">
            <div className="bg-black/60 border border-cyan-400/60 rounded px-6 py-3 text-center">
              <span className="text-cyan-400 text-sm tracking-wider font-mono">Enter Code</span>
            </div>
            <div className="mt-4 bg-black/60 border border-cyan-400/60 rounded px-6 py-4 text-center min-w-[200px]">
              <span className="text-cyan-300 text-2xl font-mono tracking-[0.3em]">
                {inputCode || "________"}
              </span>
            </div>
          </div>

          {/* Layer Toggle */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setActiveLayer("numbers")}
              className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                activeLayer === "numbers"
                  ? "bg-cyan-500/40 text-cyan-200 border border-cyan-400"
                  : "bg-black/40 text-cyan-400/60 border border-cyan-400/30 hover:border-cyan-400/60"
              }`}
            >
              1-9
            </button>
            <button
              onClick={() => setActiveLayer("letters")}
              className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                activeLayer === "letters"
                  ? "bg-cyan-500/40 text-cyan-200 border border-cyan-400"
                  : "bg-black/40 text-cyan-400/60 border border-cyan-400/30 hover:border-cyan-400/60"
              }`}
            >
              A-Z
            </button>
          </div>

          {/* Keypad */}
          {activeLayer === "numbers" ? (
            <div className="grid grid-cols-3 gap-3">
              {numbers.slice(0, 9).map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="w-14 h-14 rounded-full border-2 border-cyan-400/60 bg-black/40 text-cyan-300 text-xl font-mono hover:bg-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="w-14 h-14 rounded-full border-2 border-red-400/60 bg-black/40 text-red-400 text-sm font-mono hover:bg-red-500/30 hover:border-red-400 transition-all"
              >
                CLR
              </button>
              <button
                onClick={() => handleKeyPress("0")}
                className="w-14 h-14 rounded-full border-2 border-cyan-400/60 bg-black/40 text-cyan-300 text-xl font-mono hover:bg-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="w-14 h-14 rounded-full border-2 border-yellow-400/60 bg-black/40 text-yellow-400 text-sm font-mono hover:bg-yellow-500/30 hover:border-yellow-400 transition-all"
              >
                ←
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2 max-w-xs">
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleKeyPress(letter)}
                  className="w-10 h-10 rounded border border-cyan-400/60 bg-black/40 text-cyan-300 text-sm font-mono hover:bg-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                >
                  {letter}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="w-10 h-10 rounded border border-red-400/60 bg-black/40 text-red-400 text-xs font-mono hover:bg-red-500/30 hover:border-red-400 transition-all"
              >
                CLR
              </button>
              <button
                onClick={handleBackspace}
                className="w-10 h-10 rounded border border-yellow-400/60 bg-black/40 text-yellow-400 text-sm font-mono hover:bg-yellow-500/30 hover:border-yellow-400 transition-all"
              >
                ←
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="mt-6 w-full py-3 rounded bg-gradient-to-r from-cyan-600/60 to-blue-600/60 border border-cyan-400/60 text-cyan-200 font-mono tracking-wider hover:from-cyan-500/60 hover:to-blue-500/60 transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          >
            ENTER
          </button>

          {/* Navigation Hint */}
          <div className="mt-4 text-center text-cyan-400/60 text-xs font-mono">
            Code: 1337LEET
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
