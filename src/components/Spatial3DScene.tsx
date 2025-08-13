'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Html, 
  Float, 
  MeshDistortMaterial,
  Stars,
  Cloud
} from '@react-three/drei';
import { useSpatial3D, SpatialPanel } from '@/lib/spatial-3d';
import { useSensory } from '@/lib/sensory-system';
import * as THREE from 'three';

// 3D Panel Component
function SpatialPanel3D({ panel }: { panel: SpatialPanel }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { startDrag, endDrag } = useSpatial3D();
  const [isDragging, setIsDragging] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      // Gentle floating animation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + panel.id.charCodeAt(0)) * 0.01;
    }
  });

  const handlePointerDown = () => {
    setIsDragging(true);
    startDrag(panel.id);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    endDrag(panel.id);
  };

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
    >
      <mesh
        ref={meshRef}
        position={[panel.position.x, panel.position.y, panel.position.z]}
        rotation={[panel.rotation.x, panel.rotation.y, panel.rotation.z]}
        scale={[panel.scale.x, panel.scale.y, panel.scale.z]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[panel.size.width / 100, panel.size.height / 100]} />
        <MeshDistortMaterial
          color={panel.metadata.type === 'ai' ? '#8b5cf6' : 
                 panel.metadata.type === 'tool' ? '#06b6d4' :
                 panel.metadata.type === 'content' ? '#10b981' : '#f59e0b'}
          transparent
          opacity={panel.isDragging ? 0.8 : 0.95}
          distort={0.1}
          speed={2}
        />
        
        {/* HTML Content Overlay */}
        <Html
          transform
          occlude
          position={[0, 0, 0.01]}
          style={{
            width: panel.size.width,
            height: panel.size.height,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            overflow: 'hidden',
            pointerEvents: isDragging ? 'none' : 'auto'
          }}
        >
          <div className="w-full h-full p-4 text-white">
            <h3 className="font-bold mb-2 text-sm">{panel.title}</h3>
            <div className="text-xs opacity-75">
              Type: {panel.metadata.type}
            </div>
            <div className="mt-2 text-xs">
              {panel.component}
            </div>
          </div>
        </Html>
      </mesh>
    </Float>
  );
}

// Environmental Effects
function CyberpunkEnvironment() {
  return (
    <>
      <fog attach="fog" args={['#0a0a0a', 10, 50]} />
      <ambientLight intensity={0.3} color="#6366f1" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      
      {/* Animated particles */}
      {Array.from({ length: 100 }, (_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 100
        ]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
}

function PaperEnvironment() {
  return (
    <>
      <ambientLight intensity={0.8} color="#fef3c7" />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#fbbf24" />
      
      {/* Paper texture background */}
      <mesh position={[0, 0, -20]} scale={[50, 30, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.1} />
      </mesh>
    </>
  );
}

function NatureEnvironment() {
  return (
    <>
      <Environment preset="forest" />
      <fog attach="fog" args={['#10b981', 5, 30]} />
      <ambientLight intensity={0.6} color="#10b981" />
      
      {/* Floating leaves */}
      {Array.from({ length: 20 }, (_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 30,
            Math.random() * 10,
            (Math.random() - 0.5) * 30
          ]}>
            <planeGeometry args={[0.5, 0.3]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.7} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function SpaceEnvironment() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
      
      {/* Nebula clouds */}
      <Cloud
        position={[-20, 0, -20]}
        scale={[10, 10, 10]}
        color="#8b5cf6"
        opacity={0.3}
      />
      <Cloud
        position={[20, 10, -30]}
        scale={[15, 8, 15]}
        color="#06b6d4"
        opacity={0.2}
      />
    </>
  );
}

function MinimalEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={0.5} />
    </>
  );
}

// Camera Controller
function CameraController() {
  const { camera } = useThree();
  const { mode, activePanel, panels } = useSpatial3D();
  
  useEffect(() => {
    if (activePanel && mode.cameraMode === 'fly') {
      const panel = panels.find(p => p.id === activePanel);
      if (panel) {
        // Smooth camera movement to active panel
        camera.position.lerp(
          new THREE.Vector3(
            panel.position.x,
            panel.position.y + 3,
            panel.position.z + 5
          ),
          0.1
        );
        camera.lookAt(panel.position.x, panel.position.y, panel.position.z);
      }
    }
  }, [activePanel, camera, panels, mode.cameraMode]);

  return null;
}

// Main 3D Scene Component
export default function Spatial3DScene() {
  const { panels, environment, mode } = useSpatial3D();
  const { currentTheme } = useSensory();

  if (!mode.is3D) {
    return null; // Return 2D layout component when 3D is disabled
  }

  const renderEnvironment = () => {
    switch (environment.scene) {
      case 'cyberpunk': return <CyberpunkEnvironment />;
      case 'paper': return <PaperEnvironment />;
      case 'nature': return <NatureEnvironment />;
      case 'space': return <SpaceEnvironment />;
      default: return <MinimalEnvironment />;
    }
  };

  return (
    <div className="fixed inset-0 z-10" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ 
          position: [0, 5, 10], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        style={{ pointerEvents: 'auto' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          {/* Environment */}
          {renderEnvironment()}
          
          {/* Camera Controls */}
          {mode.cameraMode === 'orbit' && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxDistance={50}
              minDistance={2}
            />
          )}
          
          <CameraController />
          
          {/* Render all panels */}
          {panels.map(panel => (
            panel.isVisible && (
              <SpatialPanel3D key={panel.id} panel={panel} />
            )
          ))}
          
          {/* Grid helper (optional) */}
          {currentTheme.ui.animation === 'dramatic' && (
            <gridHelper args={[50, 50, '#333333', '#333333']} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
