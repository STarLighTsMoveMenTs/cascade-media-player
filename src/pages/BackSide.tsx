import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { PartnerShowcase } from "@/components/partners/PartnerShowcase";

const BackSide = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup seamless video looping
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(err => console.log('Video play error:', err));
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
      {/* Background Video */}
      <div className="fixed inset-0 -z-10">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/videos/center-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center p-6 md:p-10">
        {/* Access Header */}
        <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-8 md:p-12 shadow-[0_0_50px_rgba(0,255,255,0.3)] text-center mb-10 max-w-2xl w-full">
          <h1 className="text-3xl md:text-4xl font-mono text-cyan-300 mb-2 tracking-wider">
            ACCESS GRANTED
          </h1>
          <p className="text-cyan-400/80 font-mono mb-6">
            Welcome to the BackSide — Global Partner Directory
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/40 border border-cyan-400/40 rounded-lg p-4">
              <div className="text-cyan-300 text-xl font-mono mb-1">01</div>
              <div className="text-cyan-400/60 text-xs font-mono">System Status</div>
            </div>
            <div className="bg-black/40 border border-cyan-400/40 rounded-lg p-4">
              <div className="text-cyan-300 text-xl font-mono mb-1">OK</div>
              <div className="text-cyan-400/60 text-xs font-mono">Connection</div>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded bg-gradient-to-r from-cyan-600/60 to-blue-600/60 border border-cyan-400/60 text-cyan-200 font-mono tracking-wider hover:from-cyan-500/60 hover:to-blue-500/60 transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] text-sm"
          >
            ← BACK TO FRONT
          </button>
        </div>

        {/* Partner Showcase */}
        <div className="w-full max-w-6xl">
          <PartnerShowcase />
        </div>

        {/* Footer */}
        <div className="mt-10 mb-4 text-center text-[10px] text-slate-500 font-mono tracking-wider">
          PARTNER PORTAL v1.0 | HNOSS ORGANIZATION
        </div>
      </div>
    </div>
  );
};

export default BackSide;
