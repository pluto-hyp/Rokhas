"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Float } from "@react-three/drei";
import * as THREE from "three";

function ArchitecturalAccent({ position, rotation = [0.5, 0.5, 0.5], size = 2 }: { position: [number, number, number], rotation?: [number, number, number], size?: number }) {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial 
          color="#1A1A1A" 
          wireframe 
          transparent 
          opacity={0.05} 
        />
      </mesh>
    </Float>
  );
}

export default function ConstructionBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[var(--color-background)]">
      {/* Subtle Blue Glow Accents (Melouich Style) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      
      <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={40} />
        
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Balanced Architectural Accents */}
        <ArchitecturalAccent position={[10, 5, -5]} />
        <ArchitecturalAccent position={[-12, -4, -8]} rotation={[0.2, 0.8, 0.1]} />
        <ArchitecturalAccent position={[-4, 8, -10]} rotation={[1.1, 0.2, 0.5]} />
        
        {/* Accents closer to the 'Start Your Project' action area */}
        <ArchitecturalAccent position={[6, -2, -4]} size={1.2} rotation={[0.5, 1.2, 0.3]} />
        <ArchitecturalAccent position={[8, -5, -6]} size={0.8} rotation={[0.8, 0.1, 1.1]} />
        
        <Environment preset="studio" />
      </Canvas>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
    </div>
  );
}
