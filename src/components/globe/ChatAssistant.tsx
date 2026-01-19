import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
// import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Message = {
  role: 'user' | 'assistant';
  text: string;
};

interface ChatAssistantProps {
    onAIStateChange?: (isProcessing: boolean) => void;
    setCameraFocus?: (target: THREE.Vector3 | null) => void;
    onFlash: (type: 'single' | 'double' | 'soft') => void;
}

// --- 3D Robot Head Component ---
const RobotHead = ({ isChatOpen, isProcessing }: { isChatOpen: boolean, isProcessing: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2());
  const nextBlink = useRef(2); 
  const isBlinking = useRef(false);
  const blinkStart = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // If processing, do a little "thinking" bobble/shake
      if (isProcessing) {
         groupRef.current.rotation.z = Math.sin(time * 20) * 0.02;
         groupRef.current.position.y = Math.sin(time * 10) * 0.05;
      } else {
         const targetX = mouse.current.x * 0.5;
         const targetY = mouse.current.y * 0.5;
         groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, delta * 2);
         groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, delta * 2);
         groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 2);
         groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 2);
      }
    }

    let eyeScaleY = 1;
    if (!isChatOpen && !isProcessing) {
        if (time > nextBlink.current && !isBlinking.current) {
            isBlinking.current = true;
            blinkStart.current = time;
            nextBlink.current = time + 2 + Math.random() * 4; 
        }
        if (isBlinking.current) {
            const blinkDuration = 0.15; 
            const progress = (time - blinkStart.current) / blinkDuration;
            if (progress >= 1) { isBlinking.current = false; eyeScaleY = 1; } 
            else { eyeScaleY = Math.max(0.1, 1 - Math.sin(progress * Math.PI)); }
        }
    }

    if (eyesRef.current) {
        eyesRef.current.scale.y = eyeScaleY;
        // Intensity Logic
        const baseOpacity = isChatOpen ? 1.0 : 0.6; 
        // Super fast pulse if processing
        const pulseFrequency = isProcessing ? 25 : (isChatOpen ? 10 : 2);
        const pulseAmplitude = isProcessing ? 0.4 : (isChatOpen ? 0.2 : 0.15);
        
        const opacity = baseOpacity + Math.sin(time * pulseFrequency) * pulseAmplitude;
        
        eyesRef.current.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
                child.material.opacity = Math.min(1, Math.max(0, opacity));
                if (isProcessing) {
                    child.material.color.setHex(0xfbbf24); // Turn Gold/Amber while thinking
                } else if (isChatOpen) {
                   child.material.color.setHex(0x22d3ee); 
                } else {
                   child.material.color.setHex(0x06b6d4);
                }
            }
        });
    }
  });

  const shellMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f1f5f9", roughness: 0.2, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1,
  }), []);
  const visorMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0f172a", roughness: 0.2, metalness: 0.8, clearcoat: 1,
  }), []);
  const eyeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#22d3ee", toneMapped: false, transparent: true,
  }), []);

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.4, 1.5, 1.4]} radius={0.6} smoothness={8} material={shellMaterial} />
      <group position={[0, 0.1, 0.55]}>
        <RoundedBox args={[1.1, 0.7, 0.5]} radius={0.2} smoothness={4} material={visorMaterial} />
      </group>
      <group ref={eyesRef} position={[0, 0.15, 0.81]}>
         <mesh position={[-0.25, 0, 0]}><sphereGeometry args={[0.08, 32, 32]} /><primitive object={eyeMaterial} /></mesh>
         <mesh position={[0.25, 0, 0]}><sphereGeometry args={[0.08, 32, 32]} /><primitive object={eyeMaterial} /></mesh>
      </group>
      <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.2, 32]} /><primitive object={shellMaterial} /></mesh>
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.2, 32]} /><primitive object={shellMaterial} /></mesh>
      <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.4, 0.6, 0.5, 32]} /><meshStandardMaterial color="#334155" roughness={0.5} /></mesh>
    </group>
  );
};

// --- Main Chat Assistant UI Component ---
export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onAIStateChange, setCameraFocus, onFlash }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hello! I am your Global Connect guide. Ask me to "Show Europe" or "Analyze US Networks".' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- Cinematic Keyword Detector ---
  const detectAndExecuteCommands = (text: string) => {
      const lower = text.toLowerCase();
      // Simple coordinate mapping for demo purposes
      if (lower.includes("europe") || lower.includes("germany") || lower.includes("france")) {
          setCameraFocus?.(new THREE.Vector3(2.5, 5, 4)); // Approximate vector for Europe from space
          return "Focusing optics on European Sector...";
      }
      if (lower.includes("usa") || lower.includes("america") || lower.includes("states")) {
           setCameraFocus?.(new THREE.Vector3(-4, 3, 6)); // Approximate vector for North America
           return "Re-aligning satellites to North America...";
      }
      if (lower.includes("asia") || lower.includes("china") || lower.includes("japan")) {
          setCameraFocus?.(new THREE.Vector3(-6, 3, -4)); // Approximate vector for Asia
          return "Scanning Asian Network Hubs...";
      }
      if (lower.includes("africa")) {
          setCameraFocus?.(new THREE.Vector3(2, -1, 7)); 
          return "Targeting African Continent...";
      }
      if (lower.includes("global") || lower.includes("world")) {
          setCameraFocus?.(null); // Reset
          return "Resetting to global orbital view.";
      }
      return null;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    
    // Trigger "Thinking" State
    setIsLoading(true);
    onAIStateChange?.(true);

    // TRIGGER SINGLE FLASH (Voice Start)
    onFlash('single');

    // Cinematic Check
    const cinematicResponse = detectAndExecuteCommands(userMessage);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      
      let text = "";

      if (cinematicResponse) {
          // If we triggered a camera move, fake a delay then respond
          await new Promise(r => setTimeout(r, 1200)); 
          text = cinematicResponse + " Data retrieved.";
      } else {
         // Temporarily disabled - requires Google AI API key
         text = "AI Chat system initializing... (Google AI integration pending)";
         /*
         if (!apiKey) throw new Error("API Key missing");
         
         const ai = new GoogleGenAI({ apiKey });
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: "You are the AI OS for a futuristic holographic globe interface. Be extremely concise. Use tech jargon (Nodes, Latency, Protocols). Do not write long paragraphs.",
            }
         });
         text = response.text || "Connection unstable.";
         */
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Systems offline. Check API Protocol." }]);
    } finally {
      setIsLoading(false);
      onAIStateChange?.(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`
            pointer-events-auto mb-4 w-80 md:w-96 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-500 origin-bottom-right
            ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none h-0'}
        `}
      >
        {/* Chat Header */}
        <div className="bg-slate-800/80 p-4 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
             {/* Scanline overlay for header */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
             
             <div className="flex items-center gap-2 z-10">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-cyan-400'} animate-pulse`}></div>
                <span className="text-cyan-100 font-sans font-medium text-sm tracking-wider">SYSTEM GUIDE</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors z-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
        </div>

        {/* Messages Area */}
        <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative">
            {/* Scanline Effect Background */}
            <div className="absolute inset-0 pointer-events-none scan-overlay opacity-20"></div>

            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-bubble`}>
                    <div className={`
                        max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-light leading-relaxed backdrop-blur-sm
                        ${msg.role === 'user' 
                            ? 'bg-gradient-to-br from-purple-600/90 to-blue-600/90 text-white rounded-br-none shadow-[0_4px_15px_rgba(147,51,234,0.3)]' 
                            : 'bg-slate-700/60 text-slate-100 rounded-bl-none border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.2)]'}
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start animate-bubble">
                    <div className="bg-slate-700/60 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center border border-amber-500/30">
                        <span className="text-[10px] text-amber-400 font-mono tracking-widest mr-2">PROCESSING</span>
                        <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900/50 border-t border-white/5">
            <div className="relative group">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter command..."
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-white disabled:opacity-30 transition-all hover:scale-110"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </form>
      </div>

      {/* 3D Robot Avatar Container */}
      <div 
        className="pointer-events-auto relative w-56 h-56 md:w-64 md:h-64 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Glow effect behind robot */}
        <div className={`absolute inset-0 rounded-full blur-3xl scale-50 group-hover:scale-75 transition-all duration-700 opacity-50 ${isLoading ? 'bg-amber-500/40' : 'bg-cyan-500/20'}`}></div>
        
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} color={isLoading ? "orange" : "purple"} intensity={0.5} />
            
            <Environment preset="city" />
            
            <Float 
                speed={isLoading ? 5 : 2} 
                rotationIntensity={isLoading ? 0.5 : 0.2} 
                floatIntensity={0.5} 
            >
                <RobotHead isChatOpen={isOpen} isProcessing={isLoading} />
            </Float>
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.5} far={4} color="#000000" />
        </Canvas>
      </div>
    </div>
  );
};