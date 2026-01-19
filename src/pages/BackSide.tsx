import { useNavigate } from "react-router-dom";

const BackSide = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/videos/center-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-12 shadow-[0_0_50px_rgba(0,255,255,0.3)] text-center">
          <h1 className="text-4xl font-mono text-cyan-300 mb-4 tracking-wider">
            ACCESS GRANTED
          </h1>
          <p className="text-cyan-400/80 font-mono mb-8">
            Welcome to the BackSide
          </p>

          {/* Additional Content Area */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-black/40 border border-cyan-400/40 rounded-lg p-6">
              <div className="text-cyan-300 text-2xl font-mono mb-2">01</div>
              <div className="text-cyan-400/60 text-sm font-mono">System Status</div>
            </div>
            <div className="bg-black/40 border border-cyan-400/40 rounded-lg p-6">
              <div className="text-cyan-300 text-2xl font-mono mb-2">OK</div>
              <div className="text-cyan-400/60 text-sm font-mono">Connection</div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded bg-gradient-to-r from-cyan-600/60 to-blue-600/60 border border-cyan-400/60 text-cyan-200 font-mono tracking-wider hover:from-cyan-500/60 hover:to-blue-500/60 transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          >
            ← BACK TO FRONT
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackSide;
