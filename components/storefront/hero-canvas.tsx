"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, ContactShadows, Environment } from "@react-three/drei";

// --- PROCEDURAL 3D MODELS ---

// 1. Sleek Smartphone
function PhoneModel() {
  return (
    <group>
      {/* Main Body */}
      <RoundedBox args={[1.4, 2.8, 0.14]} radius={0.1} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#2d2d30" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      
      {/* Front Screen */}
      <RoundedBox args={[1.32, 2.72, 0.02]} radius={0.08} smoothness={2} position={[0, 0, 0.07]}>
        <meshStandardMaterial color="#08080a" roughness={0.1} />
      </RoundedBox>
      
      {/* Camera Module */}
      <RoundedBox args={[0.5, 0.5, 0.05]} radius={0.04} smoothness={2} position={[-0.32, 0.9, -0.08]}>
        <meshStandardMaterial color="#1a1a1c" roughness={0.3} metalness={0.8} />
      </RoundedBox>
      
      {/* Lenses */}
      <mesh position={[-0.32, 1.0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
        <meshStandardMaterial color="#050505" roughness={0.1} />
      </mesh>
      <mesh position={[-0.43, 0.82, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
        <meshStandardMaterial color="#050505" roughness={0.1} />
      </mesh>
      <mesh position={[-0.21, 0.82, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
        <meshStandardMaterial color="#050505" roughness={0.1} />
      </mesh>
    </group>
  );
}

// 2. Sleek Laptop (replacing gaming controller)
function LaptopModel() {
  return (
    <group position={[0, -0.3, 0]} rotation={[0.1, -0.2, 0]}>
      {/* Lower Keyboard Chassis */}
      <RoundedBox args={[2.2, 0.07, 1.5]} radius={0.03} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#ededf0" roughness={0.25} metalness={0.7} />
      </RoundedBox>

      {/* Keyboard Key Area Bezel */}
      <mesh position={[0, 0.038, -0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.9, 0.65]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.4} />
      </mesh>

      {/* Keyboard trackpad */}
      <mesh position={[0, 0.038, 0.44]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.28]} />
        <meshStandardMaterial color="#e2e2e6" roughness={0.3} />
      </mesh>

      {/* Upper Screen Lid group (angled open at 110 degrees) */}
      <group position={[0, 0.03, -0.73]} rotation={[-0.35, 0, 0]}>
        {/* Metal lid back */}
        <RoundedBox args={[2.2, 1.45, 0.03]} radius={0.03} smoothness={2} position={[0, 0.7, 0]} castShadow>
          <meshStandardMaterial color="#ededf0" roughness={0.25} metalness={0.7} />
        </RoundedBox>

        {/* Screen Bezel / Glass */}
        <RoundedBox args={[2.12, 1.37, 0.01]} radius={0.02} smoothness={2} position={[0, 0.7, 0.018]}>
          <meshStandardMaterial color="#08080a" roughness={0.1} />
        </RoundedBox>

        {/* Screen Core glowing graphic indicator (accent orange line) */}
        <mesh position={[0, 0.7, 0.024]}>
          <planeGeometry args={[1.2, 0.015]} />
          <meshBasicMaterial color="#ff4b2f" />
        </mesh>
      </group>
    </group>
  );
}

// 3. Wireless Earbuds Charging Case
function EarbudsModel() {
  return (
    <group>
      {/* Charger Case Casing */}
      <RoundedBox args={[1.5, 1.15, 0.76]} radius={0.32} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1a1c" roughness={0.25} metalness={0.2} />
      </RoundedBox>
      
      {/* Lid seam cutout */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.52, 0.02, 0.78]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Front charging indicator LED */}
      <mesh position={[0, -0.18, 0.39]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#ff4b2f" />
      </mesh>
    </group>
  );
}

// --- ACTIVE SCENE CONTROLLER ---

interface SceneProps {
  activeIdx: number;
  tilt: { x: number; y: number };
}

function Scene({ activeIdx, tilt }: SceneProps) {
  const stageRef = useRef<THREE.Group>(null);
  
  const phoneRef = useRef<THREE.Group>(null);
  const laptopRef = useRef<THREE.Group>(null);
  const earbudsRef = useRef<THREE.Group>(null);

  // Manual subtle float bobbing using frame timestamp
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const bob = Math.sin(elapsed * 1.5) * 0.08;
    const rotateBob = Math.cos(elapsed * 1.2) * 0.03;

    // 1. Mouse coordinate parallax tilt
    if (stageRef.current) {
      const targetRotX = (tilt.x * Math.PI) / 180;
      const targetRotY = (tilt.y * Math.PI) / 180;
      
      stageRef.current.rotation.x = THREE.MathUtils.lerp(stageRef.current.rotation.x, targetRotX + bob * 0.1, 0.08);
      stageRef.current.rotation.y = THREE.MathUtils.lerp(stageRef.current.rotation.y, targetRotY + rotateBob, 0.08);
      stageRef.current.position.y = THREE.MathUtils.lerp(stageRef.current.position.y, bob, 0.08);
    }

    // 2. Slide/Scale interpolation between products
    // Phone (Slide 0)
    if (phoneRef.current) {
      const targetX = activeIdx === 0 ? 0 : activeIdx === 1 ? -6 : 6;
      const targetScale = activeIdx === 0 ? 1 : 0.01;
      phoneRef.current.position.x = THREE.MathUtils.lerp(phoneRef.current.position.x, targetX, 0.08);
      phoneRef.current.scale.setScalar(THREE.MathUtils.lerp(phoneRef.current.scale.x, targetScale, 0.08));
    }

    // Laptop (Slide 1)
    if (laptopRef.current) {
      const targetX = activeIdx === 1 ? 0 : activeIdx === 2 ? -6 : 6;
      const targetScale = activeIdx === 1 ? 1.05 : 0.01;
      laptopRef.current.position.x = THREE.MathUtils.lerp(laptopRef.current.position.x, targetX, 0.08);
      laptopRef.current.scale.setScalar(THREE.MathUtils.lerp(laptopRef.current.scale.x, targetScale, 0.08));
    }

    // Earbuds (Slide 2)
    if (earbudsRef.current) {
      const targetX = activeIdx === 2 ? 0 : activeIdx === 0 ? -6 : 6;
      const targetScale = activeIdx === 2 ? 1.3 : 0.01;
      earbudsRef.current.position.x = THREE.MathUtils.lerp(earbudsRef.current.position.x, targetX, 0.08);
      earbudsRef.current.scale.setScalar(THREE.MathUtils.lerp(earbudsRef.current.scale.x, targetScale, 0.08));
    }
  });

  return (
    <group ref={stageRef} rotation={[0, -0.4, 0]}>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[6, 6, 6]} intensity={1.5} />
      
      {/* Rim light highlight color orange */}
      <spotLight position={[0, 0, -4]} intensity={2.0} color="#ff4b2f" angle={0.8} penumbra={1} />
      
      {/* Main direction light */}
      <directionalLight position={[-3, 6, -3]} intensity={1.2} castShadow />

      {/* Phone Slide */}
      <group ref={phoneRef} position={[0, 0, 0]}>
        <PhoneModel />
      </group>

      {/* Laptop Slide */}
      <group ref={laptopRef} position={[6, 0, 0]}>
        <LaptopModel />
      </group>

      {/* Earbuds Slide */}
      <group ref={earbudsRef} position={[-6, 0, 0]}>
        <EarbudsModel />
      </group>

      {/* Soft Contact Shadows (capped resolution=512 for GPU performance safety) */}
      <ContactShadows position={[0, -1.5, 0]} opacity={0.45} scale={7} blur={2.0} far={3.0} resolution={512} />

      {/* Studio reflection maps */}
      <Environment preset="studio" />
    </group>
  );
}

// --- WRAPPER RENDERING TARGET ---

interface HeroCanvasProps {
  activeIdx: number;
  tilt: { x: number; y: number };
}

export default function HeroCanvas({ activeIdx, tilt }: HeroCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 38 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={1} // Force device pixel ratio to 1 for GPU stability
        className="w-full h-full"
      >
        <Scene activeIdx={activeIdx} tilt={tilt} />
      </Canvas>
    </div>
  );
}
