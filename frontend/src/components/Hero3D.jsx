import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const ParticleSphere = () => {
  const ref = useRef();
  
  // Create 2000 points arranged loosely on a sphere to look like a data cluster
  const count = 2000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        
        // Random radius between 2.0 and 2.5
        const r = 2.0 + Math.random() * 0.5;
        p[i * 3] = x * r;
        p[i * 3 + 1] = y * r;
        p[i * 3 + 2] = z * r;
    }
    return p;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions}>
      {/* Subtle green/cyan glowing dots */}
      <PointMaterial 
        transparent 
        color="#34C759" 
        size={0.03} 
        sizeAttenuation={true} 
        depthWrite={false} 
        opacity={0.6}
      />
    </Points>
  );
};

const Hero3D = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {/* Background radial gradient to blend with the scene */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, rgba(52, 199, 89, 0.05) 0%, transparent 60%)',
      }} />
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true }}>
        <fog attach="fog" args={['#050505', 2, 8]} />
        <ambientLight intensity={0.5} />
        <ParticleSphere />
      </Canvas>
    </div>
  );
};

export default Hero3D;
