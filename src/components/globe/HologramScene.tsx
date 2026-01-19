import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';

// --- Types ---
export type LocationData = {
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  ceo: string;
  phone: string;
  address: string;
  data_value: number;
};

interface HologramSceneProps {
  onSelect: (data: LocationData) => void;
  selectedLocation: LocationData | null;
  phoenixMode: boolean;
  externalCameraFocus?: THREE.Vector3 | null;
}

// --- Helper: Convert Lat/Lon to 3D Vector ---
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

// --- Data Set ---
export const locations: LocationData[] = [
  { name: "Board for Certification of Genealogists", city: "Washington, D.C.", country: "USA", lat: 38.9072, lon: -77.0369, ceo: "President", phone: "+1 202-555-0101", address: "PO Box 14291, Washington, DC", data_value: 45 },
  { name: "U.S. Department of Commerce", city: "Washington, D.C.", country: "USA", lat: 38.8899, lon: -77.0260, ceo: "Sec. Gina Raimondo", phone: "+1 202-482-2000", address: "1401 Constitution Ave NW", data_value: 82 },
  { name: "Australian Government", city: "Canberra", country: "Australia", lat: -35.2809, lon: 149.1300, ceo: "PM Anthony Albanese", phone: "+61 2 6277 7700", address: "Parliament House, Canberra", data_value: 65 },
  { name: "Eureka Network", city: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, ceo: "Head of Secretariat", phone: "+32 2 777 09 50", address: "Avenue de Tervueren 2", data_value: 55 },
  { name: "European Commission", city: "Brussels", country: "Belgium", lat: 50.8427, lon: 4.3826, ceo: "Ursula von der Leyen", phone: "+32 2 299 11 11", address: "Rue de la Loi 200", data_value: 90 },
  { name: "Council of the European Union", city: "Brussels", country: "Belgium", lat: 50.8415, lon: 4.3813, ceo: "Charles Michel", phone: "+32 2 281 61 11", address: "Rue de la Loi 175", data_value: 78 },
  { name: "UNCTAD", city: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432, ceo: "Rebeca Grynspan", phone: "+41 22 917 1234", address: "Palais des Nations", data_value: 60 },
  { name: "WTO", city: "Geneva", country: "Switzerland", lat: 46.2230, lon: 6.1462, ceo: "Ngozi Okonjo-Iweala", phone: "+41 22 739 51 11", address: "Centre William Rappard", data_value: 88 },
  { name: "WHO", city: "Geneva", country: "Switzerland", lat: 46.2305, lon: 6.1367, ceo: "Dr. Tedros Adhanom", phone: "+41 22 791 21 11", address: "Avenue Appia 20", data_value: 95 },
  { name: "Digitale Verwaltung Schweiz", city: "Bern", country: "Switzerland", lat: 46.9480, lon: 7.4474, ceo: "Peppino Giarritta", phone: "+41 58 462 00 00", address: "Schwarztorstrasse 59", data_value: 40 },
  { name: "UN-Habitat", city: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, ceo: "Maimunah Mohd Sharif", phone: "+254 20 762 1234", address: "United Nations Avenue", data_value: 50 },
  { name: "UNEP", city: "Nairobi", country: "Kenya", lat: -1.2396, lon: 36.8170, ceo: "Inger Andersen", phone: "+254 20 762 1234", address: "United Nations Avenue", data_value: 52 },
  { name: "UN Global Compact Germany", city: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, ceo: "Marcel Engel", phone: "+49 30 726 14 0", address: "Albrechtstraße 10 B", data_value: 48 },
  { name: "Deutscher Bundestag", city: "Berlin", country: "Germany", lat: 52.5186, lon: 13.3761, ceo: "Bärbel Bas", phone: "+49 30 227 0", address: "Platz der Republik 1", data_value: 75 },
  { name: "UNICEF (HQ)", city: "New York City", country: "USA", lat: 40.7505, lon: -73.9734, ceo: "Catherine Russell", phone: "+1 212-326-7000", address: "3 United Nations Plaza", data_value: 85 },
  { name: "UN Global Compact", city: "New York City", country: "USA", lat: 40.7490, lon: -73.9680, ceo: "Sanda Ojiambo", phone: "+1 212-907-1301", address: "685 Third Avenue", data_value: 70 },
  { name: "Madison Square Garden Ent.", city: "New York City", country: "USA", lat: 40.7505, lon: -73.9934, ceo: "James L. Dolan", phone: "+1 212-465-6000", address: "4 Pennsylvania Plaza", data_value: 62 },
  { name: "IBM Corporation", city: "Armonk", country: "USA", lat: 41.1265, lon: -73.7140, ceo: "Arvind Krishna", phone: "+1 914-499-1900", address: "1 New Orchard Road", data_value: 92 },
  { name: "UNESCO", city: "Paris", country: "France", lat: 48.8566, lon: 2.3522, ceo: "Audrey Azoulay", phone: "+33 1 45 68 10 00", address: "7 Place de Fontenoy", data_value: 80 },
  { name: "European Banking Authority", city: "Paris", country: "France", lat: 48.8926, lon: 2.2483, ceo: "José Manuel Campa", phone: "+33 1 86 52 70 00", address: "20 Avenue André Prothin", data_value: 68 },
  { name: "CTBTO", city: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, ceo: "Robert Floyd", phone: "+43 1 26030 0", address: "Wagramer Str. 5", data_value: 42 },
  { name: "EUIPO", city: "Alicante", country: "Spain", lat: 38.3452, lon: -0.4810, ceo: "João Negrão", phone: "+34 965 13 91 00", address: "Avenida de Europa 4", data_value: 58 },
  { name: "FICPI", city: "Basel", country: "Switzerland", lat: 47.5596, lon: 7.5886, ceo: "President", phone: "+41 61 271 65 00", address: "Nauenstrasse 73", data_value: 35 },
  { name: "Consejo General de la Abogacía", city: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, ceo: "Victoria Ortega", phone: "+34 91 532 17 69", address: "Paseo de Recoletos 13", data_value: 46 },
  { name: "European Patent Office", city: "Munich", country: "Germany", lat: 48.1351, lon: 11.5820, ceo: "António Campinos", phone: "+49 89 2399 0", address: "Bob-van-Benthem-Platz 1", data_value: 72 },
  { name: "European Investment Fund", city: "Luxembourg", country: "Luxembourg", lat: 49.6116, lon: 6.1319, ceo: "Marjut Falkstedt", phone: "+352 2485 1", address: "37B Avenue J.F. Kennedy", data_value: 66 },
  { name: "St. Patrick’s Festival", city: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, ceo: "Richard Tierney", phone: "+353 1 604 0090", address: "Temple Bar", data_value: 30 },
  { name: "Basilica of National Shrine", city: "Washington, D.C.", country: "USA", lat: 38.9331, lon: -77.0003, ceo: "Msgr. Walter Rossi", phone: "+1 202-526-8300", address: "400 Michigan Ave NE", data_value: 38 },
  { name: "Frontegg", city: "Mountain View", country: "USA", lat: 37.3861, lon: -122.0839, ceo: "Sagi Rodin", phone: "+1 650-555-0123", address: "Mountain View, CA", data_value: 76 },
  { name: "Google", city: "Mountain View", country: "USA", lat: 37.4220, lon: -122.0841, ceo: "Sundar Pichai", phone: "+1 650-253-0000", address: "1600 Amphitheatre Pkwy", data_value: 99 },
  { name: "Auth0", city: "Bellevue", country: "USA", lat: 47.6101, lon: -122.2015, ceo: "Eugenio Pace", phone: "+1 425-555-0100", address: "10800 NE 8th St", data_value: 84 },
  { name: "Arm Ltd", city: "Cambridge", country: "UK", lat: 52.2053, lon: 0.1218, ceo: "Rene Haas", phone: "+44 1223 400400", address: "110 Fulbourn Rd", data_value: 86 },
  { name: "OpenSSF", city: "San Francisco", country: "USA", lat: 37.7749, lon: -122.4194, ceo: "Omkhar Arasaratnam", phone: "+1 415-723-9709", address: "548 Market St", data_value: 55 },
  { name: "Linux Foundation", city: "San Francisco", country: "USA", lat: 37.7949, lon: -122.4000, ceo: "Jim Zemlin", phone: "+1 415-723-9709", address: "548 Market St", data_value: 90 },
  { name: "GitHub", city: "San Francisco", country: "USA", lat: 37.7820, lon: -122.3940, ceo: "Thomas Dohmke", phone: "+1 877-448-4820", address: "88 Colin P Kelly Jr St", data_value: 94 },
  { name: "AWS", city: "Seattle", country: "USA", lat: 47.6062, lon: -122.3321, ceo: "Matt Garman", phone: "+1 206-266-1000", address: "410 Terry Ave N", data_value: 98 },
  { name: "Microsoft", city: "Redmond", country: "USA", lat: 47.6740, lon: -122.1215, ceo: "Satya Nadella", phone: "+1 425-882-8080", address: "One Microsoft Way", data_value: 97 },
  { name: "Intel", city: "Santa Clara", country: "USA", lat: 37.3541, lon: -121.9552, ceo: "Pat Gelsinger", phone: "+1 408-765-8080", address: "2200 Mission College Blvd", data_value: 91 },
  { name: "NSF", city: "Alexandria", country: "USA", lat: 38.8048, lon: -77.0469, ceo: "Sethuraman Panchanathan", phone: "+1 703-292-5111", address: "2415 Eisenhower Ave", data_value: 70 },
  { name: "I-Corps Hub", city: "Princeton", country: "USA", lat: 40.3573, lon: -74.6672, ceo: "Director", phone: "+1 609-258-3000", address: "Princeton University", data_value: 44 },
  
  // --- New Additions ---
  { name: "FINRA", city: "Washington, D.C.", country: "USA", lat: 38.9072, lon: -77.0369, ceo: "Robert W. Cook", phone: "+1 301-590-6500", address: "1735 K Street", data_value: 64 },
  { name: "500 Global", city: "San Francisco", country: "USA", lat: 37.7749, lon: -122.4194, ceo: "Christine Tsai", phone: "+1 415-555-0199", address: "814 Mission St", data_value: 73 },
  { name: "OpenAI", city: "San Francisco", country: "USA", lat: 37.7609, lon: -122.4148, ceo: "Sam Altman", phone: "+1 650-555-0100", address: "3180 18th St", data_value: 96 },
  { name: "WIPO", city: "Geneva", country: "Switzerland", lat: 46.2218, lon: 6.1394, ceo: "Daren Tang", phone: "+41 22 338 91 11", address: "34, chemin des Colombettes", data_value: 62 },
  { name: "USPTO", city: "Alexandria", country: "USA", lat: 38.8048, lon: -77.0469, ceo: "Kathi Vidal", phone: "+1 800-786-9199", address: "600 Dulany St", data_value: 81 },
  { name: "European Parliament", city: "Strasbourg", country: "France", lat: 48.5734, lon: 7.7521, ceo: "Roberta Metsola", phone: "+33 3 88 17 40 01", address: "Allée du Printemps", data_value: 89 },
  { name: "Microsoft for Startups", city: "Redmond", country: "USA", lat: 47.6740, lon: -122.1215, ceo: "VP Startups", phone: "+1 425-882-8080", address: "One Microsoft Way", data_value: 77 },
  { name: "AWS Activate", city: "Seattle", country: "USA", lat: 47.6062, lon: -122.3321, ceo: "Global Head", phone: "+1 206-266-1000", address: "410 Terry Ave N", data_value: 79 },
];

// --- Scanner Beam Component ---
const ScannerBeam: React.FC<{ phoenixMode: boolean }> = ({ phoenixMode }) => {
  const lineRef = useRef<any>(null);
  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)));
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
        const t = state.clock.elapsedTime * 0.4;
        const y = Math.sin(t) * 5.2; 
        const R = 5.08;
        const rSq = Math.max(0, R * R - y * y);
        const r = Math.sqrt(rSq);
        lineRef.current.position.y = y;
        lineRef.current.scale.set(r, 1, r);
        const opacityBase = Math.max(0, 1 - Math.abs(y)/5.2);
        const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 8) * 0.4;
        if (lineRef.current.material) {
            lineRef.current.material.opacity = opacityBase * pulse;
            lineRef.current.material.color.set(phoenixMode ? "#f97316" : "#22d3ee");
        }
    }
  });

  return (
    <Line ref={lineRef} points={points} color={phoenixMode ? "#f97316" : "#22d3ee"} lineWidth={1.5} transparent opacity={0} blending={THREE.AdditiveBlending} />
  );
};

// --- ENERGY PRISM (The Core Link) with MICRO-FLOW ---
const EnergyPrism: React.FC<{ phoenixMode: boolean }> = ({ phoenixMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Impact State for Shockwave
  const prevMode = useRef(phoenixMode);
  const impactRef = useRef(0); // 0 to 1

  // 1. Vertical Wave Lightning Path (The Core Energy)
  const wavePoints = useMemo(() => {
      // Generate a vertical path from Audio Source (-9) to Earth Core (-1.5)
      const pts = [];
      const segments = 50;
      for(let i=0; i<=segments; i++) {
          const t = i/segments;
          const y = THREE.MathUtils.lerp(-9, -1.5, t); 
          pts.push(new THREE.Vector3(0, y, 0));
      }
      return pts;
  }, []);

  // 2. Helper for Spirals (Threaded Prism)
  const spirals = useMemo(() => {
    return [0, 1, 2].map(offsetIndex => {
        const pts = [];
        const segments = 80;
        const turns = 4;
        const phase = (offsetIndex / 3) * Math.PI * 2;
        
        for(let i=0; i<=segments; i++) {
            const t = i/segments;
            const y = THREE.MathUtils.lerp(-9, -1.8, t);
            
            // Cone shape: Wide at bottom (1.8), Narrow at top (0.1)
            const radius = THREE.MathUtils.lerp(1.8, 0.1, t);
            
            const angle = t * Math.PI * 2 * turns + phase;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            pts.push(new THREE.Vector3(x, y, z));
        }
        return pts;
    });
  }, []);

  // 3. Custom Shader for Micro-Flow Plasma
  const flowShader = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(phoenixMode ? "#fbbf24" : "#22d3ee") },
        uOpacity: { value: 0.15 }, // Increased Base Opacity
        uImpact: { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uImpact;
        varying vec2 vUv;
        
        void main() {
            // Continuously rising plasma flow
            float speed = 2.0;
            float flowBase = mod(vUv.y * 6.0 - uTime * speed, 1.0); // Repeating vertical bands
            
            // Create a sharp leading edge for the flow
            float particle = pow(1.0 - abs(flowBase - 0.5) * 2.0, 8.0);
            
            // Secondary turbulence
            float noise = sin(vUv.y * 20.0 + uTime * 5.0) * 0.5 + 0.5;
            
            // Combine for "Plasma" look
            float alpha = uOpacity * (0.5 + particle * 1.5 + noise * 0.3);
            
            // Impact Flash Brightness
            alpha += uImpact * 0.5 * (1.0 - vUv.y); // Brighter at bottom on impact
            
            // Top/Bottom Fade
            alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
            
            gl_FragColor = vec4(uColor + (vec3(1.0) * uImpact), alpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  useFrame((state, delta) => {
      // Detect Mode Switch for Impact Shock
      if (prevMode.current !== phoenixMode) {
          impactRef.current = 1.0; // Trigger shock
          prevMode.current = phoenixMode;
      }
      // Decay Impact
      impactRef.current = THREE.MathUtils.lerp(impactRef.current, 0, delta * 3);

      // --- SHADER UPDATE ---
      flowShader.uniforms.uTime.value = state.clock.elapsedTime;
      const targetColor = phoenixMode ? new THREE.Color("#fbbf24") : new THREE.Color("#22d3ee");
      flowShader.uniforms.uColor.value.lerp(targetColor, delta * 2);
      flowShader.uniforms.uImpact.value = impactRef.current;
      
      // --- ANIMATION ---
      
      // 1. Central Lightning Wave
      if(lineRef.current) {
         const positions = lineRef.current.geometry.attributes.position.array;
         const t = state.clock.elapsedTime * 8; // Fast jitter
         
         for(let i=0; i<=50; i++) {
             const tNorm = i/50;
             const y = THREE.MathUtils.lerp(-9, -1.5, tNorm);
             
             // Amplitude decreases as we get closer to earth (threading in)
             // Added Impact boost to amplitude
             const amp = ((1 - tNorm) * 0.2) * (1 + impactRef.current * 2); 
             
             const noise = Math.sin(y * 10 + t) * 0.5 + Math.sin(y * 23 - t * 2) * 0.5;
             
             const x = noise * amp;
             const z = Math.cos(y * 15 + t) * amp;
             
             positions[i*3] = x;
             positions[i*3+1] = y;
             positions[i*3+2] = z;
         }
         lineRef.current.geometry.attributes.position.needsUpdate = true;
         // Flash the core line on impact
         lineRef.current.material.opacity = 0.9 + impactRef.current;
         lineRef.current.material.linewidth = 2 + impactRef.current * 4;
      }
      
      // 2. Rotate Prism & Scale on Impact
      if (groupRef.current) {
          groupRef.current.rotation.y = -state.clock.elapsedTime * 1.5;
          const scale = 1.0 + impactRef.current * 0.3;
          groupRef.current.scale.set(scale, 1, scale);
      }
  });

  const color = phoenixMode ? "#fbbf24" : "#22d3ee";
  const coreColor = phoenixMode ? "#ffffff" : "#e0f2fe";

  return (
    <group ref={groupRef}>
      {/* RADIANT POINT LIGHT (To cast light into the world) */}
      <pointLight 
        position={[0, -4, 0]} 
        intensity={phoenixMode ? 4 : 2} 
        color={color} 
        distance={15} 
        decay={2}
      />

      {/* The Central Lightning Wave */}
      <line ref={lineRef}>
          <bufferGeometry>
              <bufferAttribute 
                  attach="attributes-position" 
                  count={wavePoints.length} 
                  array={new Float32Array(wavePoints.flatMap(v => [v.x, v.y, v.z]))} 
                  itemSize={3} 
              />
          </bufferGeometry>
          <lineBasicMaterial color={coreColor} linewidth={2} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </line>

      {/* The Threading Spirals - Increased Brightness */}
      {spirals.map((pts, i) => (
          <Line 
            key={i} 
            points={pts} 
            color={color} 
            lineWidth={phoenixMode ? 3 : 2} 
            transparent 
            opacity={phoenixMode ? 0.9 : 0.7} 
            blending={THREE.AdditiveBlending} 
          />
      ))}

      {/* The Prism Shell (Glassy Cone) with Micro-Flow Shader */}
       <mesh ref={meshRef} position={[0, -5.25, 0]}>
         <cylinderGeometry args={[0.05, 1.2, 7.5, 8, 1, true]} /> {/* Tapered Cylinder from Audio to Earth */}
         <primitive object={flowShader} />
      </mesh>
    </group>
  );
};

// --- Soft Atmospheric Glow Shader ---
const Atmosphere: React.FC<{ phoenixMode: boolean }> = ({ phoenixMode }) => {
  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
      gl_FragColor = vec4(uColor, 1.0) * intensity * 1.5; 
    }
  `;
  const color = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
      const target = phoenixMode ? new THREE.Vector3(1.0, 0.2, 0.0) : new THREE.Vector3(0.9, 0.8, 0.5);
      color.lerp(target, 0.05);
  });

  return (
    <mesh>
      <sphereGeometry args={[6.2, 64, 64]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{ uColor: { value: color } }} blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent={true} depthWrite={false} />
    </mesh>
  );
};

// --- Animated Flow Particles ---
const FlowParticles: React.FC<{ start: THREE.Vector3, end: THREE.Vector3, color: string }> = ({ start, end, color }) => {
    const ref = useRef<THREE.Mesh>(null);
    const [progress, setProgress] = useState(Math.random()); 
    const curve = useMemo(() => {
        const distance = start.distanceTo(end);
        const midPoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(5 + distance * 0.5);
        return new THREE.QuadraticBezierCurve3(start, midPoint, end);
    }, [start, end]);

    useFrame((_, delta) => {
        if (ref.current) {
            setProgress(p => {
                let next = p + delta * 0.5;
                if (next > 1) next = 0;
                return next;
            });
            const point = curve.getPoint(progress);
            ref.current.position.copy(point);
            const scale = Math.sin(progress * Math.PI) * 0.25; // Increased Scale
            ref.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.95} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

// --- Connection Lines & Flow ---
const Connections: React.FC<{ activeData: LocationData | null, phoenixMode: boolean }> = ({ activeData, phoenixMode }) => {
  const lineData = useMemo(() => {
    if (!activeData && !phoenixMode) return null;
    const sourceData = activeData || (phoenixMode ? locations[17] : null); 
    if (!sourceData) return null;
    const startPos = latLonToVector3(sourceData.lat, sourceData.lon, 5);
    const targets = phoenixMode ? locations : locations.filter(l => l.name !== sourceData.name);
    return targets.map((loc, i) => {
      const endPos = latLonToVector3(loc.lat, loc.lon, 5);
      const distance = startPos.distanceTo(endPos);
      const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5).normalize().multiplyScalar(5 + distance * 0.5);
      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
      const curvePoints = curve.getPoints(30);
      return { curvePoints, startPos, endPos, id: i };
    });
  }, [activeData, phoenixMode]);

  if (!lineData) return null;

  return (
    <group>
        {lineData.map((d) => (
            <React.Fragment key={d.id}>
                <Line points={d.curvePoints} color={phoenixMode ? "#ef4444" : "#d97706"} lineWidth={phoenixMode ? 2 : 1} transparent opacity={phoenixMode ? 0.6 : 0.3} blending={THREE.AdditiveBlending} />
                {d.id % (phoenixMode ? 2 : 1) === 0 && (
                    <FlowParticles start={d.startPos} end={d.endPos} color={phoenixMode ? "#ffffff" : "#fbbf24"} />
                )}
            </React.Fragment>
        ))}
    </group>
  );
};

// --- Interactive Data Marker ---
const DataMarker: React.FC<{ data: LocationData; index: number; isSelected: boolean; onSelect: (d: LocationData) => void; phoenixMode: boolean; }> = ({ data, index, isSelected, onSelect, phoenixMode }) => {
  const [hovered, setHover] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const radiusOffset = 0.02 + (index * 0.005); 
  const position = useMemo(() => latLonToVector3(data.lat, data.lon, 5 + radiusOffset), [data.lat, data.lon, radiusOffset]);
  const barHeight = (data.data_value / 100) * 1.5 + 0.2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
      let currentScale = hovered || isSelected ? (isSelected ? 2.2 : 1.8) : 1.0;
      if (phoenixMode) currentScale *= (1 + Math.sin(state.clock.elapsedTime * 4 + index) * 0.2);
      meshRef.current.position.copy(position).setLength(5 + radiusOffset + (isSelected ? 0.2 : 0));
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, currentScale, 0.1));
    }
  });

  const markerColor = phoenixMode ? (isSelected ? "#ffffff" : "#ef4444") : (isSelected ? "#ffffff" : "#fbbf24");

  return (
    <group position={position} ref={meshRef}>
      <group 
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      >
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={markerColor} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0, -barHeight / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.002, barHeight, 4]} />
          <meshBasicMaterial color={markerColor} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

// --- Main Earth Component ---
const Earth: React.FC<{ selectedLocation: LocationData | null; onSelect: (d: LocationData) => void; phoenixMode: boolean }> = ({ selectedLocation, onSelect, phoenixMode }) => {
  const [texture, lightsTexture] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'
  ]);

  const earthColor = phoenixMode ? "#450a0a" : "#3b0764";
  const lightsColor = phoenixMode ? "#ef4444" : "#fbbf24";
  const wireColor = phoenixMode ? "#f97316" : "#fcd34d";

  return (
    <group>
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial map={texture} color={earthColor} transparent opacity={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.01, 64, 64]} />
        <meshBasicMaterial map={lightsTexture} blending={THREE.AdditiveBlending} transparent opacity={0.9} color={lightsColor} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.02, 64, 64]} />
        <meshBasicMaterial color={wireColor} wireframe={true} transparent opacity={phoenixMode ? 0.15 : 0.05} blending={THREE.AdditiveBlending} />
      </mesh>
      {locations.map((loc, idx) => (
        <DataMarker key={idx} index={idx} data={loc} isSelected={selectedLocation?.name === loc.name} onSelect={onSelect} phoenixMode={phoenixMode} />
      ))}
      <Connections activeData={selectedLocation} phoenixMode={phoenixMode} />
      <ScannerBeam phoenixMode={phoenixMode} />
      <EnergyPrism phoenixMode={phoenixMode} />
      <Atmosphere phoenixMode={phoenixMode} />
    </group>
  );
};

// --- HIGH-FIDELITY STAR FIELD & METEORS ---

const TwinklingStars: React.FC<{ phoenixMode: boolean }> = ({ phoenixMode }) => {
  const particleCount = 4500;
  
  // Custom Shader for Twinkling with Depth Grading
  const starShaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(phoenixMode ? "#f87171" : "#ffffff") }
    },
    vertexShader: `
        uniform float time;
        attribute float size;
        attribute float brightness; // New attribute for tiered brightness
        varying float vAlpha;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            // Scale size based on distance and inherent size
            gl_PointSize = size * (300.0 / -mvPosition.z);
            
            // Twinkle Logic: Varied speed based on brightness tier
            float twinkleSpeed = 2.0 + brightness; 
            float twinkle = sin(time * twinkleSpeed + position.x * 0.1 + position.y * 0.1);
            
            // Brightness determines base alpha and twinkle range
            float baseAlpha = brightness; 
            vAlpha = baseAlpha + (0.3 * twinkle * brightness); 
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
            // Soft circular particle
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            
            // Soften edges
            float opacity = vAlpha * (1.0 - smoothstep(0.3, 0.5, ll));
            gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [phoenixMode]);

  const { positions, sizes, brightness } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    const br = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        // Spherical distribution
        const r = 250 + Math.random() * 800;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);

        // --- Tiered Depth Grading ---
        const tier = Math.random();
        if (tier > 0.95) {
            // Hero Stars (5%)
            sz[i] = 4.0 + Math.random() * 2.0;
            br[i] = 1.0; 
        } else if (tier > 0.80) {
            // Mid Stars (15%)
            sz[i] = 2.5 + Math.random() * 1.5;
            br[i] = 0.6;
        } else {
            // Background Stars (80%)
            sz[i] = 1.5 + Math.random();
            br[i] = 0.3; // Dim
        }
    }
    return { positions: pos, sizes: sz, brightness: br };
  }, []);

  useFrame((state) => {
      starShaderMaterial.uniforms.time.value = state.clock.elapsedTime;
      starShaderMaterial.uniforms.color.value.set(phoenixMode ? "#f87171" : "#ffffff");
  });

  return (
    <points>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
            <bufferAttribute attach="attributes-size" count={particleCount} array={sizes} itemSize={1} />
            <bufferAttribute attach="attributes-brightness" count={particleCount} array={brightness} itemSize={1} />
        </bufferGeometry>
        <primitive object={starShaderMaterial} />
    </points>
  );
};

const SingleShootingStar = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [active, setActive] = useState(false);
    
    // Reset function
    const reset = () => {
        if (!meshRef.current) return;
        // Start somewhere far on a sphere
        const r = 350;
        // Restrict to Upper Hemisphere (Heavenly)
        const theta = Math.random() * Math.PI * 2;
        // Phi restricted to top cone (0 to 1.2 radians approx) to keep them high
        const phi = Math.random() * 1.2; 
        
        const startPos = new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi), // Swapped Y/Z logic for standard Three.js Y-up if needed, but latLonToVector3 used Y as up. 
            // In standard sphere coords: x=r sin phi cos theta, y=r cos phi (if phi from pole), z=r sin phi sin theta
            // Let's ensure y is positive (Up)
            r * Math.sin(phi) * Math.sin(theta)
        );
        
        // Ensure Y is strictly positive and high
        if (startPos.y < 50) startPos.y = 50 + Math.random() * 100;

        // Target: cross screen but stay somewhat high
        const endPos = startPos.clone().add(new THREE.Vector3(
            (Math.random()-0.5)*400, 
            -(Math.random() * 100), // Slight downward trend
            (Math.random()-0.5)*400
        ));
        
        meshRef.current.position.copy(startPos);
        meshRef.current.lookAt(endPos);
        meshRef.current.userData = { 
            velocity: 4 + Math.random() * 2, // Slower, majestic speed
            life: 1.0,
            direction: endPos.sub(startPos).normalize()
        };
        setActive(true);
    };

    useFrame((_, delta) => {
        if (!active) {
            // Häufigere Spawn-Rate für mehr sichtbare Sternschnuppen
            if (Math.random() < 0.002) reset(); 
            return;
        }

        if (meshRef.current) {
            const data = meshRef.current.userData;
            meshRef.current.position.add(data.direction.clone().multiplyScalar(data.velocity * delta * 60)); 
            data.life -= delta * 0.3; // Längere Lebensdauer
            
            // Update opacity/scale for trail effect
            const scale = Math.max(0, data.life);
            // Longer tail (scale Z)
            meshRef.current.scale.set(1.5, 1.5, scale * 100); // Größer und längerer Schweif
            (meshRef.current.material as THREE.MeshBasicMaterial).opacity = scale * 0.9;

            if (data.life <= 0) setActive(false);
        }
    });

    return (
        <mesh ref={meshRef} visible={active}>
            {/* A long thin cylinder/cone for the trail */}
            <cylinderGeometry args={[0, 0.6, 1, 8]} /> 
            <meshBasicMaterial color="#a5f3fc" transparent blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

const ShootingStarSystem = () => {
    // Create a pool of shooting stars
    const stars = useMemo(() => new Array(77).fill(0), []); // 77 Sternschnuppen - optimiert für Performance
    return (
        <group>
            {stars.map((_, i) => <SingleShootingStar key={i} />)}
        </group>
    );
};

// --- Cinematic Camera Manager ---
const CameraManager: React.FC<{ 
    phoenixMode: boolean, 
    selectedLocation: LocationData | null,
    externalFocus?: THREE.Vector3 | null 
}> = ({ phoenixMode, selectedLocation, externalFocus }) => {
    const { camera, controls } = useThree();
    
    useFrame((state, delta) => {
        const controlsImpl = controls as any;
        const time = state.clock.elapsedTime;
        
        // --- BREATHING ZOOM (Deep Cinematic) ---
        // Slower cycle (12s) for more "weight"
        const breathingOffset = Math.sin(time * 0.5) * 0.4;

        if (externalFocus) {
             // --- EXTERNAL FOCUS OVERRIDE ---
             const focusWithBreath = externalFocus.clone().addScalar(breathingOffset * 0.1);
             camera.position.lerp(focusWithBreath, delta * 1.5);
             if (controlsImpl) {
                 controlsImpl.autoRotate = false; 
                 controlsImpl.target.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
             }
        } 
        else if (phoenixMode) {
             // --- PHOENIX MODE ---
             const targetPos = new THREE.Vector3(10 + breathingOffset, -5, 12 + breathingOffset);
             camera.position.lerp(targetPos, delta * 0.5);
             if (controlsImpl) {
                 controlsImpl.autoRotate = true;
                 controlsImpl.autoRotateSpeed = 5.0; 
             }
        } else if (selectedLocation) {
             // --- SELECTED NODE ---
             if (controlsImpl) {
                 controlsImpl.autoRotate = true;
                 controlsImpl.autoRotateSpeed = 0.5;
             }
        } else {
             // --- IDLE STATE (FREE CONTROL) ---
             // We REMOVE the forced lerp here to allow free manual rotation/zoom.
             if (controlsImpl) {
                 controlsImpl.autoRotate = true;
                 controlsImpl.autoRotateSpeed = 0.5;
                 // Ensure target stays at center of earth
                 controlsImpl.target.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
             }
        }
        
        if (controlsImpl) controlsImpl.update();
    });
    return null;
}

export const HologramScene: React.FC<HologramSceneProps> = ({ onSelect, selectedLocation, phoenixMode, externalCameraFocus }) => {
  return (
    <>
      <CameraManager 
        phoenixMode={phoenixMode} 
        selectedLocation={selectedLocation} 
        externalFocus={externalCameraFocus}
      />
      <color attach="background" args={['#020005']} />
      <fog attach="fog" args={[phoenixMode ? '#220000' : '#020005', 10, 100]} />
      
      <group rotation={[0, 0, 0.2]}> 
        <React.Suspense fallback={null}>
          <Earth selectedLocation={selectedLocation} onSelect={onSelect} phoenixMode={phoenixMode} />
        </React.Suspense>
      </group>
      
      <TwinklingStars phoenixMode={phoenixMode} />
      <ShootingStarSystem />
      
      <OrbitControls 
        makeDefault
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={true}
        autoRotateSpeed={phoenixMode ? 4 : 0.5}
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={35}
        rotateSpeed={0.5} 
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </>
  );
};