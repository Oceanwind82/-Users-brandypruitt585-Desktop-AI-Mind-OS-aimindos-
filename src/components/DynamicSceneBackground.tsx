'use client';

import React, { useEffect, useRef } from 'react';
import { useDynamicScenes } from '@/lib/dynamic-scenes';
import { useSensory } from '@/lib/sensory-system';

export default function DynamicSceneBackground() {
  const { currentScene } = useDynamicScenes();
  const { currentTheme } = useSensory();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
  }>>([]);
  const animationRef = useRef<number>(0);

  // Apply CSS background styles
  useEffect(() => {
    if (!currentScene) return;

    const body = document.body;
    
    // Remove existing scene classes
    body.className = body.className.replace(/scene-\w+/g, '');
    
    // Apply new scene
    body.classList.add(`scene-${currentScene.id}`);
    
    // Apply CSS styles
    if (currentScene.css) {
      let style = document.getElementById('dynamic-scene-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'dynamic-scene-style';
        document.head.appendChild(style);
      }
      
      style.textContent = `
        body.scene-${currentScene.id} {
          ${currentScene.css}
          transition: all 2s ease-in-out;
        }
        
        body.scene-${currentScene.id}::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          ${currentScene.css}
          pointer-events: none;
        }
      `;
    }

    return () => {
      // Cleanup on unmount
      const style = document.getElementById('dynamic-scene-style');
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, [currentScene]);

  // Particle effects
  useEffect(() => {
    if (!currentScene?.config.effects?.particles || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particlesRef.current = [];
    const particleCount = currentScene.category === 'cyberpunk' ? 100 : 50;
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: currentScene.config.colors?.[Math.floor(Math.random() * currentScene.config.colors.length)] || '#ffffff'
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx * (currentScene.config.animation?.speed || 1);
        particle.y += particle.vy * (currentScene.config.animation?.speed || 1);
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        
        if (currentScene.category === 'cyberpunk') {
          // Draw glowing squares for cyberpunk
          ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
        } else if (currentScene.category === 'space') {
          // Draw stars for space
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#ffffff';
        } else {
          // Draw circles for other categories
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentScene]);

  // Matrix rain effect for cyberpunk scenes
  useEffect(() => {
    if (currentScene?.id !== 'cyberpunk_rain' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';

    const animateRain = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationRef.current = requestAnimationFrame(animateRain);
    };

    animateRain();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentScene]);

  if (!currentScene) return null;

  return (
    <>
      {/* Particle Canvas */}
      {currentScene.config.effects?.particles && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none"
          style={{ 
            zIndex: -1,
            opacity: currentTheme.ui.animation === 'smooth' ? 0.3 : 0.6
          }}
        />
      )}

      {/* Additional Effect Overlays */}
      {currentScene.config.effects?.fog && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -1,
            background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)`,
            animation: 'fogDrift 20s ease-in-out infinite'
          }}
        />
      )}

      {currentScene.config.effects?.holographic && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -1,
            background: `linear-gradient(45deg, transparent 0%, rgba(139, 92, 246, 0.1) 25%, transparent 50%, rgba(6, 182, 212, 0.1) 75%, transparent 100%)`,
            backgroundSize: '100px 100px',
            animation: 'holographicShift 3s linear infinite'
          }}
        />
      )}

      {currentScene.config.effects?.paper_texture && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -1,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(0,0,0,0.05) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05) 1px, transparent 1px),
              radial-gradient(circle at 40% 60%, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px, 30px 30px, 25px 25px'
          }}
        />
      )}

      {/* Global animations */}
      <style jsx>{`
        @keyframes fogDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -5px) scale(1.1); }
          66% { transform: translate(-5px, 10px) scale(0.9); }
        }
        
        @keyframes holographicShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100px 100px; }
        }
      `}</style>
    </>
  );
}
