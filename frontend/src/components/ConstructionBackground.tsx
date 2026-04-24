"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Protractor({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(2, 2, 0.05, 64, 1, false, 0, Math.PI);
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={[Math.PI / 2.5, 0, 0]} geometry={geometry}>
        <meshPhysicalMaterial 
          transparent 
          opacity={0.2} 
          roughness={0} 
          metalness={0.1} 
          transmission={1} 
          thickness={1}
          color="#38BDF8"
        />
        {/* Inner circle cut */}
        <mesh position={[0, -0.01, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.06, 64, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial transparent opacity={0} transmission={1} thickness={0} />
        </mesh>
      </mesh>
    </Float>
  );
}

function Compass({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
      <group position={position} rotation={[0.5, -0.5, 0.2]}>
        {/* Head/Pivot */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
          <meshStandardMaterial color="#94A3B8" metalness={1} roughness={0.1} />
        </mesh>
        {/* Leg 1 */}
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.06, 0.02, 3, 12]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Leg 2 */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.06, 0.02, 3, 12]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Needle point */}
        <mesh position={[-0.6, -1.5, 0]}>
          <coneGeometry args={[0.02, 0.2, 8]} />
          <meshStandardMaterial color="#475569" metalness={1} />
        </mesh>
      </group>
    </Float>
  );
}

function Blueprint({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position} rotation={[-Math.PI / 4, 0, 0.1]}>
        <mesh>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial color="#1E3A8A" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
        {/* Grid lines */}
        <gridHelper args={[6, 12, "#38BDF8", "#1E40AF"]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </Float>
  );
}

export default function ConstructionBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#0F172A]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={40} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38BDF8" />
        
        <Protractor position={[-6, 3, -2]} />
        <Compass position={[5, -2, 0]} />
        <Blueprint position={[-2, -4, -5]} />
        
        <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        <Environment preset="night" />
        
        {/* Subtle particles for atmosphere */}
        <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 10 - 5]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} transparent opacity={0.5} />
            </mesh>
          ))}
        </Float>
      </Canvas>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-transparent to-[#0F172A]/90" />
    </div>
  );
}
