'use client';
import React from 'react';

interface LoadingScreenProps {
  phase: string;
  progress: number;
  status: string;
}

const PHASE_ICONS: Record<string, string> = {
  idle: '⏳',
  runtime: '⚙️',
  pose: '🦴',
  face: '👁️',
  ready: '✅',
  error: '❌',
};

export default function LoadingScreen({ phase, progress, status }: LoadingScreenProps) {
  const icon = PHASE_ICONS[phase] ?? '⏳';

  return (
    <div className="loading-screen">
      {/* Animated mirror frame */}
      <div className="loading-mirror">
        {/* Scanlines */}
        <div className="scanlines" />

        {/* Center content */}
        <div className="loading-center">
          {/* Logo */}
          <div className="loading-logo">
            <div className="logo-glow" />
            <div className="logo-ring">
              <span className="logo-icon">✦</span>
            </div>
          </div>

          <h1 className="loading-title">AURA</h1>
          <p className="loading-sub">AI Virtual Try‑On</p>

          {/* Phase icon */}
          <div className="phase-icon">{icon}</div>

          {/* Status */}
          <p className="loading-status">{status}</p>

          {/* Progress bar */}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <div
              className="progress-glow"
              style={{ left: `calc(${progress}% - 12px)` }}
            />
          </div>

          <p className="progress-pct">{progress}%</p>
        </div>
      </div>

      {/* Corner decorations */}
      {['tl', 'tr', 'bl', 'br'].map(c => (
        <div key={c} className={`corner-deco corner-${c}`} />
      ))}
    </div>
  );
}
