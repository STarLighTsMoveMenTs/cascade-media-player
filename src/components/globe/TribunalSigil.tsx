import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sparkles, Cone, Torus } from '@react-three/drei';
import * as THREE from 'three';

// --- Reusable Materials ---
const usePhoenixMaterials = () => {
  const armorMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#d97706", // Amber-600
    emissive: "#7c2d12", // Dark Orange/Red glow
    emissiveIntensity: 0.2,
    roughness: 0.3,
    metalness: 1.0,
    clearcoat: 1.0,
  }), []);

  const fireMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#ff4500", // OrangeRed
    transparent: true,
    opacity: 0.9,
  }), []);

  const energyMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#fbbf24", // Amber-400
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6,
  }), []);

  return { armorMaterial, fireMaterial, energyMaterial };
};

// --- Procedural Wing Component ---
const MechaWing = ({ side = 1, materials }: { side: number, materials: any }) => {
  // Create a fan of sharp blades to mimic feathers
  const blades = useMemo(() => new Array(7).fill(0), []);
  
  return (
    <group rotation={[0, 0, side * 0.3]} position={[side * 0.2, 0.5, 0]}>
      {/* Main Wing Arm */}
      <mesh position={[side * 0.6, 0, 0]} rotation={[0, 0, side * -0.2]}>
         <boxGeometry args={[1.4, 0.15, 0.1]} />
         <primitive object={materials.armorMaterial} />
      </mesh>

      {/* Feathers */}
      {blades.map((_, i) => (
        <group key={i} position={[side * (0.2 + i * 0.15), -0.05, 0]} rotation={[0, 0, side * (-0.3 - i * 0.15)]}>
            {/* Metal Base */}
            <mesh position={[0, -0.4, 0]}>
                <coneGeometry args={[0.06, 0.8 + i * 0.1, 4]} />
                <primitive object={materials.armorMaterial} />
            </mesh>
            {/* Energy Tip */}
            <mesh position={[0, -0.9 - (i * 0.05), 0]} scale={[1, -1, 1]}>
                <coneGeometry args={[0.04, 0.6, 4]} />
                <primitive object={materials.fireMaterial} />
            </mesh>
        </group>
      ))}
    </group>
  );
};

// --- Swirling Tail Component ---
const SwirlingTail = ({ materials }: { materials: any }) => {
  return (
    <group position={[0, -0.5, -0.2]}>
        {/* Main Tail Segment */}
        <mesh position={[0, -0.5, 0]} rotation={[3, 0, 0]}>
            <coneGeometry args={[0.15, 1.2, 5]} />
            <primitive object={materials.armorMaterial} />
        </mesh>

        {/* Swirl 1 - Large ribbon to the left */}
        <group rotation={[0, 0, 0.5]} position={[-0.2, -0.5, 0]}>
             <Torus args={[1.2, 0.03, 8, 32, 2.5]} rotation={[0, 2, 0.5]}>
                <primitive object={materials.energyMaterial} />
             </Torus>
        </group>

        {/* Swirl 2 - Large ribbon to the right */}
        <group rotation={[0, 0, -0.5]} position={[0.2, -0.8, 0.1]}>
             <Torus args={[1.0, 0.04, 8, 32, 2.2]} rotation={[0, -2.5, -0.5]}>
                <primitive object={materials.fireMaterial} />
             </Torus>
        </group>

        {/* Swirl 3 - Central downward spiral */}
        <group position={[0, -1.2, 0]}>
             <Torus args={[0.6, 0.02, 8, 32, 4]} rotation={[1.5, 0, 0]}>
                <primitive object={materials.energyMaterial} />
             </Torus>
        </group>
    </group>
  );
};

const PhoenixModel = ({ isActive }: { isActive: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materials = usePhoenixMaterials();
  const intensityRef = useRef(0.2);

  useFrame((state, delta) => {
    if (groupRef.current) {
        // --- BREATHING ANIMATION ---
        // Constant gentle pulse
        const breath = Math.sin(state.clock.elapsedTime * 2) * 0.03;
        groupRef.current.scale.setScalar(1 + breath);

        // Hovering motion
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.1;
        // Subtle tilt
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

        // --- REACTIVE PULSE LOGIC ---
        // AWAKENING TRIGGER: If active, ramp up intensity drastically to "Blinding Heat" levels
        const targetIntensity = isActive ? 4.0 : 0.2; // 4.0 is very bright
        intensityRef.current = THREE.MathUtils.lerp(intensityRef.current, targetIntensity, delta * 3);
        
        // Apply pulse (Slower idle pulse: 0.8 speed approx 8s cycle logic)
        // Active: Fast violent pulse
        // Idle: Very slow majesty (factor 0.8)
        const pulse = isActive 
            ? Math.sin(state.clock.elapsedTime * 20) * 1.5 + 1.5 
            : Math.sin(state.clock.elapsedTime * 0.8) * 0.2; 

        const currentEmission = intensityRef.current + pulse;
        
        // Update materials dynamically
        materials.armorMaterial.emissiveIntensity = currentEmission;
        // Energy material becomes almost solid when active
        materials.energyMaterial.opacity = isActive ? 1.0 : 0.6 + breath * 2;
        // Fire material shifts to white-hot
        if (isActive) {
             materials.fireMaterial.color.setHex(0xffaa00);
        } else {
             materials.fireMaterial.color.set("#ff4500");
        }
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- BODY --- */}
      <group position={[0, 0, 0]}>
        {/* Chest */}
        <mesh position={[0, 0.1, 0.1]}>
            <octahedronGeometry args={[0.35, 1]} />
            <primitive object={materials.armorMaterial} />
        </mesh>
        {/* Glowing Core */}
        <mesh position={[0, 0.1, 0.3]}>
            <dodecahedronGeometry args={[0.15, 0]} />
            <primitive object={materials.energyMaterial} />
        </mesh>
        {/* Spine/Neck Base */}
        <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.1, 0.25, 0.6, 6]} />
            <primitive object={materials.armorMaterial} />
        </mesh>
      </group>

      {/* --- HEAD --- */}
      <group position={[0, 0.8, 0.2]} rotation={[0.2, 0, 0]}>
         {/* Cranium */}
         <mesh>
            <coneGeometry args={[0.18, 0.4, 4]} /> {/* Pyramid shape */}
            <primitive object={materials.armorMaterial} />
         </mesh>
         {/* Beak */}
         <mesh position={[0, -0.1, 0.2]} rotation={[-2.5, 0, 0]}>
            <coneGeometry args={[0.08, 0.4, 4]} />
            <primitive object={materials.armorMaterial} />
         </mesh>
         {/* Glowing Eyes */}
         <mesh position={[0.1, 0, 0.12]} rotation={[0, 0, -0.2]}>
             <boxGeometry args={[0.05, 0.1, 0.15]} />
             <primitive object={materials.energyMaterial} />
         </mesh>
         <mesh position={[-0.1, 0, 0.12]} rotation={[0, 0, 0.2]}>
             <boxGeometry args={[0.05, 0.1, 0.15]} />
             <primitive object={materials.energyMaterial} />
         </mesh>
         {/* Head Crest / Fire Plumes */}
         <mesh position={[0, 0.15, -0.1]} rotation={[-0.5, 0, 0]}>
             <coneGeometry args={[0.02, 0.6, 4]} />
             <primitive object={materials.fireMaterial} />
         </mesh>
         <mesh position={[0.1, 0.1, -0.05]} rotation={[-0.4, 0, -0.4]}>
             <coneGeometry args={[0.02, 0.5, 4]} />
             <primitive object={materials.fireMaterial} />
         </mesh>
         <mesh position={[-0.1, 0.1, -0.05]} rotation={[-0.4, 0, 0.4]}>
             <coneGeometry args={[0.02, 0.5, 4]} />
             <primitive object={materials.fireMaterial} />
         </mesh>
      </group>

      {/* --- WINGS --- */}
      <MechaWing side={1} materials={materials} />
      <MechaWing side={-1} materials={materials} />

      {/* --- TAIL --- */}
      <SwirlingTail materials={materials} />

      {/* --- PARTICLES --- */}
      <Sparkles 
        count={isActive ? 150 : 60} 
        scale={isActive ? 4 : 3} 
        size={isActive ? 6 : 4} 
        speed={isActive ? 2 : 0.8} // Constant subtle motion
        opacity={0.5} 
        color="#fbbf24"
        position={[0, 0, 0]}
      />
    </group>
  );
};

export const TribunalSigil: React.FC<{ isActive?: boolean }> = ({ isActive = false }) => {
  return (
    <div className="fixed top-6 right-8 z-50 w-40 h-40 pointer-events-none hidden md:block transition-all duration-500">
      {/* Background Glow to enhance the 'Seal' effect */}
      <div className={`absolute inset-0 bg-orange-600/10 rounded-full blur-3xl transition-transform duration-1000 ${isActive ? 'scale-125 bg-orange-500/30' : 'scale-90 animate-pulse'}`}></div>
      
      <div className="w-full h-full relative">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={3} color="#fbbf24" />
            <pointLight position={[0, -2, 2]} intensity={2} color="#ff4500" distance={5} />
            
            <Environment preset="sunset" />
            
            <Float 
                speed={isActive ? 5 : 2} 
                rotationIntensity={isActive ? 0.3 : 0.1} 
                floatIntensity={0.2} 
                floatingRange={[-0.1, 0.1]}
            >
                {/* Rotator Group for the Sigil Spin */}
                <group rotation={[0, -0.3, 0]}>
                     <PhoenixModel isActive={isActive} />
                </group>
            </Float>
        </Canvas>
        
        {/* Label */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className={`text-[9px] font-mono tracking-[0.4em] uppercase text-center border-t border-orange-500/20 pt-2 shadow-[0_-4px_10px_rgba(251,191,36,0.1)] transition-colors duration-1000 ${isActive ? 'text-amber-300' : 'text-orange-400/70 animate-pulse'}`}>
                {isActive ? 'PROCESSING...' : 'Phoenix Protocol'}
            </div>
        </div>
      </div>
    </div>
  );
};