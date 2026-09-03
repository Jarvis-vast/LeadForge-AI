import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
}

interface SignalPulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  alpha: number;
}

export const NetworkConstellation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Create subtle nodes
    let nodes: Node[] = [];
    let signals: SignalPulse[] = [];

    const initNodes = () => {
      const nodeCount = Math.min(64, Math.floor((width * height) / 22000));
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          radius: Math.random() < 0.2 ? 2.2 : Math.random() * 1.5 + 0.8,
          baseAlpha: Math.random() * 0.25 + 0.08,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initNodes();

    // Occasional signal pulse traveling between connected nodes
    const spawnSignalInterval = setInterval(() => {
      if (nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      // find nearest neighbor within connection distance
      let nearest = -1;
      let minDst = 160;
      for (let j = 0; j < nodes.length; j++) {
        if (j === from) continue;
        const dx = nodes[j].x - nodes[from].x;
        const dy = nodes[j].y - nodes[from].y;
        const dst = Math.sqrt(dx * dx + dy * dy);
        if (dst < minDst) {
          minDst = dst;
          nearest = j;
        }
      }
      if (nearest !== -1 && signals.length < 12) {
        signals.push({
          fromNode: from,
          toNode: nearest,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
          alpha: 0.6 + Math.random() * 0.4,
        });
      }
    }, 900);

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Deep dark canvas background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Very subtle radial ambient gradient for depth
      const gradient = ctx.createRadialGradient(
        width * 0.6,
        height * 0.4,
        width * 0.05,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.005)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw connections
      const maxDistance = 170;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Wrap around borders gently
        if (n1.x < -20) n1.x = width + 20;
        if (n1.x > width + 20) n1.x = -20;
        if (n1.y < -20) n1.y = height + 20;
        if (n1.y > height + 20) n1.y = -20;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.09;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(4)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Draw signal pulses traveling across filaments
      for (let s = signals.length - 1; s >= 0; s--) {
        const sig = signals[s];
        sig.progress += sig.speed;
        if (sig.progress >= 1) {
          signals.splice(s, 1);
          continue;
        }

        const n1 = nodes[sig.fromNode];
        const n2 = nodes[sig.toNode];
        if (!n1 || !n2) {
          signals.splice(s, 1);
          continue;
        }

        const curX = n1.x + (n2.x - n1.x) * sig.progress;
        const curY = n1.y + (n2.y - n1.y) * sig.progress;
        const pulseAlpha = Math.sin(sig.progress * Math.PI) * sig.alpha * 0.35;

        // Signal packet dot
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(curX, curY, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulse = Math.sin(time * 1.5 + node.pulsePhase) * 0.08;
        const alpha = Math.max(0.04, Math.min(0.45, node.baseAlpha + pulse));

        // Subtle outer glow for higher-radius nodes
        if (node.radius > 1.8) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(alpha * 0.2).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(spawnSignalInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
