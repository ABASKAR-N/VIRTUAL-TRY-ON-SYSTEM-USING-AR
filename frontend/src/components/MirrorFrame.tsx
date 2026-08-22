'use client';
import React, { useEffect, useRef } from 'react';

interface MirrorFrameProps {
  accent: string;
  isLoaded: boolean;
}

export default function MirrorFrame({ accent, isLoaded }: MirrorFrameProps) {
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const el = scanRef.current;
    if (!el) return;
    let y = -100;
    let raf: number;
    const animate = () => {
      y += 1.2;
      if (y > window.innerHeight + 100) y = -100;
      el.style.transform = `translateY(${y}px)`;
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [isLoaded]);

  return (
    <>
      {/* Top mirror label */}
      <div className="mirror-label">
        <span className="mirror-label-text">YOUR REFLECTION</span>
        <div className="mirror-label-line" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      </div>

      {/* Corner brackets */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
        <div
          key={pos}
          className={`mirror-bracket mirror-bracket--${pos}`}
          style={{ borderColor: accent + '99' }}
        />
      ))}

      {/* Neon edge glow */}
      <div
        className="mirror-glow-edge mirror-glow-edge--left"
        style={{ background: `linear-gradient(to right, ${accent}44, transparent)` }}
      />
      <div
        className="mirror-glow-edge mirror-glow-edge--right"
        style={{ background: `linear-gradient(to left, ${accent}44, transparent)` }}
      />
      <div
        className="mirror-glow-edge mirror-glow-edge--top"
        style={{ background: `linear-gradient(to bottom, ${accent}33, transparent)` }}
      />

      {/* Scanline sweep */}
      {isLoaded && (
        <div ref={scanRef} className="mirror-scanline" style={{ background: `linear-gradient(to bottom, transparent, ${accent}18, transparent)` }} />
      )}

      {/* Grid overlay (subtle AR feel) */}
      <div className="mirror-grid" />
    </>
  );
}
