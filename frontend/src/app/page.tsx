"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Zap, Check, Shirt, Glasses, PersonStanding, ShoppingBag, Star } from 'lucide-react';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import MirrorFrame from '@/components/MirrorFrame';

// ── Catalog Data ──────────────────────────────────────────────────
const EYEWEAR: CatalogItem[] = [
  { id: 'e1', name: 'Classic Aviator', price: 129, shape: 'aviator', frameColor: '#c8a96b', lensColor: 'rgba(180,160,80,0.38)', accent: '#f5c842', tag: 'Pilot' },
  { id: 'e2', name: 'Wayfarer', price: 99, shape: 'square', frameColor: '#1a1a1a', lensColor: 'rgba(20,20,20,0.55)', accent: '#9ca3af', tag: 'Classic' },
  { id: 'e3', name: 'Round John', price: 119, shape: 'round', frameColor: '#7c2d12', lensColor: 'rgba(160,80,30,0.38)', accent: '#f97316', tag: 'Vintage' },
  { id: 'e4', name: 'Cat-Eye', price: 145, shape: 'cateye', frameColor: '#4a044e', lensColor: 'rgba(180,0,230,0.3)', accent: '#e879f9', tag: 'Glam' },
  { id: 'e5', name: 'Sports Shield', price: 89, shape: 'shield', frameColor: '#042f2e', lensColor: 'rgba(0,200,180,0.4)', accent: '#2dd4bf', tag: 'Sport' },
  { id: 'e6', name: 'Cyber Hex', price: 159, shape: 'hex', frameColor: '#0f0f1a', lensColor: 'rgba(0,255,255,0.25)', accent: '#00ffff', tag: 'Cyber' },
  { id: 'e7', name: 'Slim Rimless', price: 79, shape: 'rimless', frameColor: '#aaa', lensColor: 'rgba(200,200,255,0.2)', accent: '#c7d2fe', tag: 'Minimal' },
  { id: 'e8', name: 'Oversized', price: 135, shape: 'oversized', frameColor: '#1c1917', lensColor: 'rgba(40,20,0,0.5)', accent: '#d97706', tag: 'Fashion' },
];
const TOPS: CatalogItem[] = [
  { id: 't1', name: 'Urban Hoodie', price: 85, color: '#1e293b', accent: '#38bdf8', tag: 'Casual' },
  { id: 't2', name: 'Blazer Elite', price: 195, color: '#1c1917', accent: '#f59e0b', tag: 'Formal' },
  { id: 't3', name: 'Graphic Tee', price: 45, color: '#1a1a2e', accent: '#a855f7', tag: 'Street' },
  { id: 't4', name: 'Leather Jacket', price: 285, color: '#0c0a09', accent: '#ef4444', tag: 'Edge' },
  { id: 't5', name: 'Sports Jersey', price: 65, color: '#052e16', accent: '#22c55e', tag: 'Sport' },
  { id: 't6', name: 'Denim Shirt', price: 75, color: '#0c1d3b', accent: '#60a5fa', tag: 'Denim' },
];
const BOTTOMS: CatalogItem[] = [
  { id: 'b1', name: 'Slim Jeans', price: 95, color: '#1e3a5f', accent: '#60a5fa', tag: 'Casual', style: 'pants' },
  { id: 'b2', name: 'Cargo Pants', price: 85, color: '#1a2e1a', accent: '#4ade80', tag: 'Street', style: 'pants' },
  { id: 'b3', name: 'Chinos', price: 79, color: '#3d2b1f', accent: '#d97706', tag: 'Smart', style: 'pants' },
  { id: 'b4', name: 'Mini Skirt', price: 55, color: '#3b0764', accent: '#c084fc', tag: 'Glam', style: 'skirt' },
  { id: 'b5', name: 'Shorts', price: 49, color: '#0c2340', accent: '#38bdf8', tag: 'Sport', style: 'shorts' },
  { id: 'b6', name: 'Maxi Skirt', price: 69, color: '#1c0a28', accent: '#e879f9', tag: 'Boho', style: 'skirt' },
];

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  accent: string;
  tag: string;
  shape?: string;
  frameColor?: string;
  lensColor?: string;
  color?: string;
  style?: string;
};

type Tab = 'eyewear' | 'tops' | 'bottoms';
type P = { x: number; y: number };

// ── AR: Glasses ───────────────────────────────────────────────────
function drawGlasses(ctx: CanvasRenderingContext2D, lm: P[], shape: string, frameColor: string, lensColor: string, accent: string, video?: HTMLVideoElement) {
  const loOuter = lm[33], loInner = lm[133], roInner = lm[362], roOuter = lm[263], noseBridge = lm[168];
  const lEar = lm[234], rEar = lm[454]; // ear tragion landmarks for temple arms
  const lBrow = lm[70], rBrow = lm[300]; // brow landmarks for vertical positioning
  if (!loOuter || !loInner || !roInner || !roOuter || !noseBridge) return;

  const lCx = (loOuter.x + loInner.x) / 2, lCy = (loOuter.y + loInner.y) / 2;
  const rCx = (roInner.x + roOuter.x) / 2, rCy = (roInner.y + roOuter.y) / 2;
  const faceW = Math.hypot(roOuter.x - loOuter.x, roOuter.y - loOuter.y);
  const lensW = Math.hypot(loOuter.x - loInner.x, loOuter.y - loInner.y) * 1.75;
  const lensH = lensW * (shape === 'shield' || shape === 'oversized' ? 0.56 : shape === 'round' ? 0.72 : 0.65);
  const angle = Math.atan2(rCy - lCy, rCx - lCx);
  const frameThick = Math.max(4, faceW * 0.028);

  ctx.save();

  // 1. CAST SHADOW ON FACE (multi-layer AO)
  for (let s = 0; s < 2; s++) {
    ctx.save();
    ctx.filter = s === 0 ? 'blur(22px)' : 'blur(8px)';
    ctx.globalAlpha = s === 0 ? 0.3 : 0.15;
    ctx.fillStyle = '#000';
    [{ cx: lCx, cy: lCy }, { cx: rCx, cy: rCy }].forEach(({ cx, cy }) => {
      ctx.save();
      ctx.translate(cx, cy + (s === 0 ? 14 : 6));
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, lensW / (s === 0 ? 1.6 : 1.9), lensH / (s === 0 ? 1.6 : 2.2), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  // Helper: define lens path
  const defineLensPath = (w: number, h: number) => {
    ctx.beginPath();
    switch (shape) {
      case 'round': ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); break;
      case 'cateye':
        ctx.moveTo(-w / 2, h / 4);
        ctx.bezierCurveTo(-w / 2, -h / 1.8, -w * 0.1, -h / 2, w / 2, -h / 1.1);
        ctx.quadraticCurveTo(w / 2.2, h / 3, 0, h / 2.5);
        ctx.quadraticCurveTo(-w / 4, h / 2, -w / 2, h / 4);
        break;
      case 'aviator':
        ctx.moveTo(-w * 0.44, -h * 0.42);
        ctx.quadraticCurveTo(-w * 0.1, -h / 2, w * 0.44, -h * 0.42);
        ctx.quadraticCurveTo(w / 2, -h * 0.1, w * 0.38, h * 0.35);
        ctx.quadraticCurveTo(w * 0.15, h / 2, -w * 0.1, h * 0.42);
        ctx.quadraticCurveTo(-w * 0.35, h * 0.38, -w * 0.44, -h * 0.42);
        break;
      case 'shield': ctx.roundRect(-w / 2, -h / 2, w, h, [4, 4, h / 2.5, h / 2.5]); break;
      case 'hex':
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 6;
          const px = Math.cos(a) * w / 2, py = Math.sin(a) * h / 2;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        break;
      case 'rimless': ctx.ellipse(0, 0, w / 2, h / 2.2, 0, 0, Math.PI * 2); break;
      case 'oversized': ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.12); break;
      default: ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.08);
    }
    ctx.closePath();
  };

  const drawLens = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // A. Refraction (magnified video behind lens)
    if (video) {
      ctx.save();
      defineLensPath(lensW, lensH);
      ctx.clip();
      const zoom = 1.06;
      const vw = video.videoWidth, vh = video.videoHeight;
      const cw = ctx.canvas.width, ch = ctx.canvas.height;
      const normCx = cx / cw, normCy = cy / ch;
      const sw = (lensW / cw) * vw / zoom, sh = (lensH / ch) * vh / zoom;
      const sx = (1 - normCx) * vw - sw / 2, sy = normCy * vh - sh / 2;
      ctx.save(); ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, -lensW / 2, -lensH / 2, lensW, lensH);
      ctx.restore();
      // Barrel distortion illusion
      ctx.globalAlpha = 0.08;
      const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, lensW / 2);
      dg.addColorStop(0, 'transparent'); dg.addColorStop(0.7, 'transparent'); dg.addColorStop(1, lensColor);
      ctx.fillStyle = dg; ctx.fill();
      ctx.restore();
    }

    // B. Polarized lens gradient
    defineLensPath(lensW, lensH);
    const lg = ctx.createLinearGradient(0, -lensH / 2, 0, lensH / 2);
    lg.addColorStop(0, lensColor);
    lg.addColorStop(0.35, accent + '44');
    lg.addColorStop(0.65, lensColor);
    lg.addColorStop(1, accent + '66');
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = lg;
    ctx.fill();

    // C. Chromatic aberration (subtle)
    ctx.save(); ctx.globalAlpha = 0.12; ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#ff3b30'; defineLensPath(lensW + 2, lensH + 1); ctx.stroke();
    ctx.translate(1.2, 0.5);
    ctx.strokeStyle = '#007aff'; defineLensPath(lensW + 2, lensH + 1); ctx.stroke();
    ctx.restore();

    // D. Environment reflection sweep
    ctx.save();
    defineLensPath(lensW, lensH); ctx.clip();
    const rg = ctx.createLinearGradient(-lensW * 0.6, -lensH * 0.6, lensW * 0.6, lensH * 0.6);
    rg.addColorStop(0, 'rgba(255,255,255,0.5)');
    rg.addColorStop(0.12, 'rgba(255,255,255,0.08)');
    rg.addColorStop(0.45, 'transparent');
    rg.addColorStop(0.85, 'rgba(255,255,255,0.12)');
    rg.addColorStop(1, 'rgba(255,255,255,0.25)');
    ctx.fillStyle = rg; ctx.fill();

    // Window reflection (softbox)
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.roundRect(-lensW * 0.28, -lensH * 0.38, lensW * 0.14, lensH * 0.28, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
    // Secondary small highlight
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(lensW * 0.18, -lensH * 0.15, lensW * 0.04, lensH * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
    ctx.restore();

    // E. Frame with 3D depth
    if (shape !== 'rimless') {
      // Outer frame (dark edge = depth)
      ctx.lineWidth = frameThick + 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      defineLensPath(lensW, lensH); ctx.stroke();
      // Main frame color
      ctx.lineWidth = frameThick;
      ctx.strokeStyle = frameColor;
      defineLensPath(lensW, lensH); ctx.stroke();
      // Top bevel highlight
      ctx.save(); defineLensPath(lensW, lensH); ctx.clip();
      ctx.lineWidth = frameThick * 2.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.moveTo(-lensW, -lensH * 0.48); ctx.lineTo(lensW, -lensH * 0.48);
      ctx.stroke();
      // Bottom inner shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.moveTo(-lensW, lensH * 0.42); ctx.lineTo(lensW, lensH * 0.42);
      ctx.stroke();
      ctx.restore();
      // Inner rim edge
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      defineLensPath(lensW - frameThick, lensH - frameThick); ctx.stroke();
    } else {
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      defineLensPath(lensW, lensH); ctx.stroke();
      // Thin bottom wire for rimless
      ctx.lineWidth = 0.8; ctx.strokeStyle = frameColor;
      ctx.beginPath(); ctx.moveTo(-lensW / 2.5, lensH / 3); ctx.lineTo(lensW / 2.5, lensH / 3); ctx.stroke();
    }

    ctx.restore();
  };

  drawLens(lCx, lCy);
  drawLens(rCx, rCy);

  // 7. NOSE PADS (metallic)
  const padW = Math.max(3, faceW * 0.018), padH = padW * 1.8;
  const drawNosePad = (x: number, y: number, side: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + side * 0.35);
    // Pad arm
    ctx.beginPath(); ctx.moveTo(0, -padH * 1.5); ctx.lineTo(0, 0);
    ctx.strokeStyle = 'rgba(180,180,180,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
    // Pad body
    ctx.beginPath(); ctx.ellipse(0, 0, padW, padH, 0, 0, Math.PI * 2);
    const pg = ctx.createRadialGradient(-padW * 0.3, -padH * 0.3, 0, 0, 0, padH);
    pg.addColorStop(0, 'rgba(255,255,255,0.8)'); pg.addColorStop(0.5, 'rgba(200,200,200,0.5)'); pg.addColorStop(1, 'rgba(100,100,100,0.3)');
    ctx.fillStyle = pg; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();
  };
  drawNosePad(noseBridge.x - faceW * 0.04, noseBridge.y + faceW * 0.04, -1);
  drawNosePad(noseBridge.x + faceW * 0.04, noseBridge.y + faceW * 0.04, 1);

  // 8. BRIDGE (3D metallic)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(loInner.x, loInner.y);
  const bMidY = (lBrow && rBrow) ? Math.min(noseBridge.y - 6, (lBrow.y + rBrow.y) / 2 + 8) : noseBridge.y - 8;
  ctx.quadraticCurveTo(noseBridge.x, bMidY, roInner.x, roInner.y);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = frameThick + 1.5; ctx.stroke();
  ctx.strokeStyle = frameColor; ctx.lineWidth = frameThick - 0.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();

  // 9. TEMPLE ARMS (follow ears, 3D)
  ctx.save();
  const drawTemple = (from: P, ear: P | undefined, dir: number) => {
    const ex = ear ? ear.x : from.x + dir * faceW * 0.55;
    const ey = ear ? ear.y : from.y + faceW * 0.15;
    // Shadow
    ctx.save(); ctx.globalAlpha = 0.3; ctx.filter = 'blur(3px)';
    ctx.beginPath(); ctx.moveTo(from.x, from.y + 2);
    ctx.bezierCurveTo(from.x + dir * 20, from.y - 8, ex - dir * 15, ey - 10, ex, ey + 8);
    ctx.strokeStyle = '#000'; ctx.lineWidth = frameThick + 1; ctx.stroke();
    ctx.restore();
    // Main arm
    ctx.beginPath(); ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(from.x + dir * 20, from.y - 10, ex - dir * 15, ey - 12, ex, ey + 5);
    ctx.strokeStyle = frameColor; ctx.lineWidth = frameThick; ctx.lineCap = 'round'; ctx.stroke();
    // Highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(from.x + dir * 5, from.y - 2);
    ctx.bezierCurveTo(from.x + dir * 25, from.y - 12, ex - dir * 20, ey - 14, ex - dir * 5, ey + 2);
    ctx.stroke();
    // Tip curl
    ctx.beginPath(); ctx.moveTo(ex, ey + 5);
    ctx.quadraticCurveTo(ex + dir * 3, ey + 18, ex - dir * 4, ey + 25);
    ctx.strokeStyle = frameColor; ctx.lineWidth = frameThick * 0.7; ctx.stroke();
  };
  drawTemple(loOuter, lEar, -1);
  drawTemple(roOuter, rEar, 1);
  ctx.restore();

  ctx.restore();
}

// ── AR: Top Wear ──────────────────────────────────────────────────
function drawTopWear(ctx: CanvasRenderingContext2D, ls: P, rs: P, lh: P, rh: P, color: string, accent: string, name: string, price: number) {
  const topY = (ls.y + rs.y) / 2, cx = (ls.x + rs.x) / 2, sw = Math.hypot(rs.x - ls.x, rs.y - ls.y), arm = sw * 0.55;
  const hipY = (lh.y + rh.y) / 2, bodyH = hipY - topY, nw = sw * 0.18, nd = bodyH * 0.18;

  ctx.save();
  ctx.shadowBlur = 35;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';

  // Fabric Gradient (Cylindrical Shading)
  const fabricGrad = ctx.createLinearGradient(ls.x - arm, 0, rs.x + arm, 0);
  fabricGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
  fabricGrad.addColorStop(0.2, color);
  fabricGrad.addColorStop(0.5, accent);
  fabricGrad.addColorStop(0.8, color);
  fabricGrad.addColorStop(1, 'rgba(0,0,0,0.4)');

  const definePath = () => {
    ctx.beginPath();
    ctx.moveTo(cx + nw, topY);
    ctx.lineTo(rs.x + arm * 0.13, topY - bodyH * 0.04);
    ctx.lineTo(rs.x + arm, topY + bodyH * 0.02);
    ctx.lineTo(rs.x + arm * 0.82, topY + bodyH * 0.33);
    ctx.lineTo(rs.x * 0.92 + cx * 0.08, topY + bodyH * 0.36);
    ctx.lineTo(rs.x * 0.55 + cx * 0.45, hipY);
    ctx.lineTo(ls.x * 0.55 + cx * 0.45, hipY);
    ctx.lineTo(ls.x * 0.92 + cx * 0.08, topY + bodyH * 0.36);
    ctx.lineTo(ls.x - arm * 0.82, topY + bodyH * 0.33);
    ctx.lineTo(ls.x - arm, topY + bodyH * 0.02);
    ctx.lineTo(ls.x - arm * 0.13, topY - bodyH * 0.04);
    ctx.lineTo(cx - nw, topY);
    ctx.quadraticCurveTo(cx, topY + nd * 1.6, cx + nw, topY);
    ctx.closePath();
  };

  // 1. Edge Shadow (AO)
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.filter = 'blur(12px)';
  definePath();
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  // 2. Main Fabric
  definePath();
  ctx.fillStyle = fabricGrad;
  ctx.fill();

  // 3. Fabric Grain (Noise)
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(ls.x - arm + Math.random() * (sw + arm * 2), topY + Math.random() * bodyH, 1, 1);
  }
  ctx.restore();

  // 4. Details
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Floating Label
  ctx.save();
  ctx.translate(rs.x + arm * 0.3, topY - 30);
  ctx.beginPath();
  ctx.roundRect(0, 0, 80, 40, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.font = '900 11px Outfit, sans-serif';
  ctx.fillText(name.toUpperCase(), 10, 16);
  ctx.fillStyle = accent;
  ctx.fillText(`$${price}`, 10, 30);
  ctx.restore();

  ctx.restore();
}

// ── AR: Bottom Wear ───────────────────────────────────────────────
// ── AR: Bottom Wear ───────────────────────────────────────────────
function drawBottomWear(ctx: CanvasRenderingContext2D, lh: P, rh: P, lk: P, rk: P, la: P, ra: P, color: string, accent: string, style: string) {
  ctx.save();
  const hipMidX = (lh.x + rh.x) / 2, hipMidY = (lh.y + rh.y) / 2;
  const hipW = Math.hypot(rh.x - lh.x, rh.y - lh.y) * 1.35; // slightly wider hips for cloth
  const hipTilt = Math.atan2(rh.y - lh.y, rh.x - lh.x);
  
  // Fabric material logic
  const createFabricGradient = (x1: number, y1: number, x2: number, y2: number, isLeg = false) => {
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    if (isLeg) {
      grad.addColorStop(0, 'rgba(0,0,0,0.65)'); // deep outseam shadow
      grad.addColorStop(0.15, color);
      grad.addColorStop(0.4, accent); // front thigh highlight
      grad.addColorStop(0.7, color);
      grad.addColorStop(0.9, 'rgba(0,0,0,0.4)'); // inner thigh shadow
      grad.addColorStop(1, 'rgba(0,0,0,0.7)'); // deep inseam shadow
    } else {
      grad.addColorStop(0, 'rgba(0,0,0,0.5)');
      grad.addColorStop(0.25, color);
      grad.addColorStop(0.5, accent);
      grad.addColorStop(0.75, color);
      grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    }
    return grad;
  };

  const applyMaterial = (mainPath: () => void, bounds: {x:number, y:number, w:number, h:number}, isLeg = false, legIdx = 0) => {
    ctx.save();
    
    // 1. Ambient Occlusion (soft drop shadow)
    ctx.save();
    ctx.shadowBlur = 35;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.globalAlpha = 0.4;
    mainPath();
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    // 2. Base Fabric & Cylindrical Shading
    mainPath();
    ctx.fillStyle = createFabricGradient(bounds.x, bounds.y, bounds.x + bounds.w, bounds.y, isLeg);
    ctx.fill();

    // 3. Dynamic Fabric Folds (Creases)
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.35;
    for (let f = 0; f < (isLeg ? 5 : 8); f++) {
      const fx = bounds.x + bounds.w * (0.1 + Math.random() * 0.8);
      const fy = bounds.y + bounds.h * (isLeg ? Math.random() * 0.8 : Math.random() * 1);
      const fh = bounds.h * (0.2 + Math.random() * 0.4);
      const fw = bounds.w * (0.05 + Math.random() * 0.1);
      
      const foldGrad = ctx.createLinearGradient(fx - fw, 0, fx + fw, 0);
      foldGrad.addColorStop(0, 'transparent');
      foldGrad.addColorStop(0.3, 'rgba(255,255,255,0.15)'); // highlight ridge
      foldGrad.addColorStop(0.6, 'rgba(0,0,0,0.4)'); // shadow valley
      foldGrad.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      if (isLeg) {
        // V-shaped tension folds near crotch/knees
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(fx + (legIdx===1?fw:-fw)*3, fy + fh/2, fx + (legIdx===1?fw:-fw), fy + fh);
      } else {
        // Vertical drape folds for skirt/hips
        ctx.moveTo(fx, bounds.y);
        ctx.quadraticCurveTo(fx + fw * (Math.random() - 0.5)*2, fy + fh/2, fx, bounds.y + bounds.h);
      }
      ctx.lineWidth = fw * 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = foldGrad;
      ctx.stroke();
    }
    
    // 4. Fabric Texture (Noise grain)
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < bounds.w * bounds.h * 0.03; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(bounds.x + Math.random() * bounds.w, bounds.y + Math.random() * bounds.h, 1.5, 1.5);
    }
    ctx.restore();

    // 5. Seams & Edges
    mainPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  };

  // Rendering logic based on style
  if (style === 'skirt') {
    const hemY = (lk.y + rk.y) / 2 + hipW * 0.2; // flows down to knee level
    const flare = hipW * 0.7; // A-line skirt flare
    const ctlY = hipMidY + (hemY - hipMidY) * 0.5; // control point for drape

    const skirtPath = () => {
      ctx.beginPath();
      // Waist
      ctx.moveTo(lh.x - hipW * 0.5, lh.y);
      ctx.lineTo(rh.x + hipW * 0.5, rh.y);
      // Right side curve
      ctx.quadraticCurveTo(rh.x + hipW * 0.5 + flare*0.4, ctlY, hipMidX + hipW * 0.5 + flare, hemY);
      // Hemline curve (3D cylinder bottom)
      ctx.quadraticCurveTo(hipMidX, hemY + hipW*0.3, hipMidX - hipW * 0.5 - flare, hemY);
      // Left side curve
      ctx.quadraticCurveTo(lh.x - hipW * 0.5 - flare*0.4, ctlY, lh.x - hipW * 0.5, lh.y);
      ctx.closePath();
    };
    
    const bounds = { x: hipMidX - hipW*0.5 - flare, y: hipMidY, w: hipW + flare*2, h: hemY - hipMidY + hipW*0.3 };
    applyMaterial(skirtPath, bounds);

    // Inner back hem shadow for 3D volume
    ctx.save();
    ctx.clip(new Path2D(`M ${hipMidX + hipW * 0.5 + flare} ${hemY} Q ${hipMidX} ${hemY + hipW*0.3} ${hipMidX - hipW * 0.5 - flare} ${hemY} Q ${hipMidX} ${hemY - hipW*0.1} ${hipMidX + hipW * 0.5 + flare} ${hemY} Z`));
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fill();
    ctx.restore();

  } else {
    // PANTS or SHORTS
    const isShorts = style === 'shorts';
    const bL = isShorts ? lk : la;
    const bR = isShorts ? rk : ra;
    const leW = hipW * (isShorts ? 0.45 : 0.35); // leg width
    const crotchY = Math.min(lk.y, rk.y) - (Math.min(lk.y, rk.y) - hipMidY) * (isShorts ? 0.3 : 0.6); // dynamic crotch drop

    const renderLeg = (hip: P, knee: P, ankle: P, isRight: boolean) => {
      const dir = isRight ? 1 : -1;
      const hx = hip.x + dir * hipW * 0.45; // outer hip
      const cx = hipMidX + dir * hipW * 0.1; // inner crotch
      
      const outKneeX = knee.x + dir * leW * 0.9;
      const inKneeX = knee.x - dir * leW * 0.7;
      
      const outAnkleX = ankle.x + dir * leW;
      const inAnkleX = ankle.x - dir * leW;
      
      const legPath = () => {
        ctx.beginPath();
        // Waist top
        ctx.moveTo(cx, hipMidY);
        ctx.lineTo(hx, hip.y);
        // Outseam
        ctx.quadraticCurveTo(hx + dir * leW * 0.2, (hip.y + knee.y)/2, outKneeX, knee.y);
        ctx.lineTo(outAnkleX, ankle.y);
        // Hem
        ctx.quadraticCurveTo(ankle.x, ankle.y + leW * 0.3, inAnkleX, ankle.y);
        // Inseam
        ctx.lineTo(inKneeX, knee.y);
        ctx.quadraticCurveTo(cx - dir * leW * 0.1, (crotchY + knee.y)/2, cx, crotchY);
        ctx.closePath();
      };

      const boundsX = Math.min(hx, cx, outAnkleX, inAnkleX);
      const boundsW = Math.max(hx, cx, outAnkleX, inAnkleX) - boundsX;
      applyMaterial(legPath, { x: boundsX, y: hipMidY, w: boundsW, h: ankle.y - hipMidY }, true, isRight?1:0);

      // Detail: Outseam stitch line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(hx, hip.y);
      ctx.quadraticCurveTo(hx + dir * leW * 0.2, (hip.y + knee.y)/2, outKneeX, knee.y);
      ctx.lineTo(outAnkleX, ankle.y);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    // Render back leg first (whichever is higher Y, simple depth sort)
    if (bL.y < bR.y) {
      renderLeg(lh, lk, bL, false);
      renderLeg(rh, rk, bR, true);
    } else {
      renderLeg(rh, rk, bR, true);
      renderLeg(lh, lk, bL, false);
    }

    // Crotch overlap / fly detail
    ctx.beginPath();
    ctx.moveTo(hipMidX, hipMidY);
    ctx.lineTo(hipMidX, crotchY + hipW * 0.1);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Fly stitching
    ctx.beginPath();
    ctx.moveTo(hipMidX - hipW * 0.08, hipMidY);
    ctx.quadraticCurveTo(hipMidX - hipW * 0.1, crotchY, hipMidX, crotchY + hipW * 0.05);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 6. DETAILED 3D WAISTBAND
  ctx.save();
  ctx.translate(hipMidX, hipMidY);
  ctx.rotate(hipTilt);
  
  const wbH = 22; // waistband height
  const wbW = hipW * 1.05;
  const wbY = -12;
  
  // Waistband base
  ctx.beginPath();
  ctx.roundRect(-wbW/2, wbY, wbW, wbH, [4, 4, 6, 6]);
  
  const wbGrad = ctx.createLinearGradient(-wbW/2, 0, wbW/2, 0);
  wbGrad.addColorStop(0, 'rgba(0,0,0,0.8)');
  wbGrad.addColorStop(0.2, color);
  wbGrad.addColorStop(0.5, accent);
  wbGrad.addColorStop(0.8, color);
  wbGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
  
  ctx.fillStyle = wbGrad;
  ctx.fill();
  
  // Top/bottom edge highlights
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-wbW/2, wbY + 1.5); ctx.lineTo(wbW/2, wbY + 1.5); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-wbW/2, wbY + wbH); ctx.lineTo(wbW/2, wbY + wbH); ctx.stroke();

  // Belt loops
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1;
  const drawLoop = (x: number) => {
    ctx.beginPath();
    ctx.roundRect(x - 4, wbY - 2, 8, wbH + 4, 2);
    ctx.fill(); ctx.stroke();
    // loop highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x - 2, wbY, 2, wbH);
  };
  drawLoop(-wbW * 0.35);
  drawLoop(wbW * 0.35);
  drawLoop(-wbW * 0.15);
  drawLoop(wbW * 0.15);

  // Center Button
  ctx.beginPath();
  ctx.arc(0, wbY + wbH/2, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#b87333'; // copper/brass button
  ctx.fill();
  ctx.strokeStyle = '#5c3a1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath(); ctx.arc(0, wbY + wbH/2, 3, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.stroke();

  ctx.restore();
  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────
export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('eyewear');
  const [selEyewear, setSelEyewear] = useState(EYEWEAR[0]);
  const [selTop, setSelTop] = useState(TOPS[0]);
  const [selBottom, setSelBottom] = useState(BOTTOMS[0]);
  const [flash, setFlash] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const smoothedFaceLm = useRef<P[]>([]);
  const smoothedPoseLm = useRef<P[]>([]);
  const { poseLandmarker, faceLandmarker, isLoaded, loadingStatus } = useMediaPipe();

  const catalog = activeTab === 'eyewear' ? EYEWEAR : activeTab === 'tops' ? TOPS : BOTTOMS;
  const selected = activeTab === 'eyewear' ? selEyewear : activeTab === 'tops' ? selTop : selBottom;
  const selId = selected.id;

  const setSelected = (item: CatalogItem) => {
    if (activeTab === 'eyewear') setSelEyewear(item);
    else if (activeTab === 'tops') setSelTop(item);
    else setSelBottom(item);
  };

  // Snapshot
  const handleSnapshot = useCallback(() => {
    const v = webcamRef.current?.video, c = canvasRef.current; if (!v || !c) return;
    setFlash(true); setTimeout(() => setFlash(false), 200);
    const s = document.createElement('canvas'); s.width = v.videoWidth; s.height = v.videoHeight;
    const x = s.getContext('2d')!; x.translate(s.width, 0); x.scale(-1, 1); x.drawImage(v, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(c, 0, 0);
    const a = document.createElement('a'); a.href = s.toDataURL('image/png'); a.download = `aura-${Date.now()}.png`; a.click();
  }, []);

  // When tab changes, scroll strip back to start
  useEffect(() => { stripRef.current?.scrollTo({ left: 0, behavior: 'smooth' }); }, [activeTab]);

  // AR loop
  useEffect(() => {
    if (!isLoaded) return;
    let raf: number, last = -1;
    const tick = () => {
      const video = webcamRef.current?.video, canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) { raf = requestAnimationFrame(tick); return; }
      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      if (last === video.currentTime) { raf = requestAnimationFrame(tick); return; }
      last = video.currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      const W = canvas.width, H = canvas.height;
      const px = (l: { x: number, y: number }) => ({ x: (1 - l.x) * W, y: l.y * H });
      if (activeTab === 'eyewear' && faceLandmarker) {
        const res = faceLandmarker.detectForVideo(video, now);
        if (res.faceLandmarks?.length) {
          const rawLm = res.faceLandmarks[0].map(px);
          const alpha = 0.6;
          if (smoothedFaceLm.current.length === 0) smoothedFaceLm.current = rawLm;
          else {
            smoothedFaceLm.current = rawLm.map((p, i) => ({
              x: p.x * alpha + smoothedFaceLm.current[i].x * (1 - alpha),
              y: p.y * alpha + smoothedFaceLm.current[i].y * (1 - alpha)
            }));
          }
          drawGlasses(ctx, smoothedFaceLm.current, selEyewear.shape!, selEyewear.frameColor!, selEyewear.lensColor!, selEyewear.accent, video);
        }
      }
      if ((activeTab === 'tops' || activeTab === 'bottoms') && poseLandmarker) {
        const res = poseLandmarker.detectForVideo(video, now);
        if (res.landmarks?.length) {
          const rawLm = res.landmarks[0].map(px);
          const alpha = 0.45; // More smoothing for pose
          if (smoothedPoseLm.current.length === 0) smoothedPoseLm.current = rawLm;
          else {
            smoothedPoseLm.current = rawLm.map((p, i) => ({
              x: p.x * alpha + (smoothedPoseLm.current[i]?.x || p.x) * (1 - alpha),
              y: p.y * alpha + (smoothedPoseLm.current[i]?.y || p.y) * (1 - alpha)
            }));
          }
          const lm = smoothedPoseLm.current;
          if (activeTab === 'tops') {
            if (lm[11] && lm[12] && lm[23] && lm[24]) drawTopWear(ctx, lm[11], lm[12], lm[23], lm[24], selTop.color!, selTop.accent, selTop.name, selTop.price);
          } else {
            if (lm[23] && lm[24] && lm[25] && lm[26] && lm[27] && lm[28]) drawBottomWear(ctx, lm[23], lm[24], lm[25], lm[26], lm[27], lm[28], selBottom.color!, selBottom.accent, selBottom.style!);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, [isLoaded, faceLandmarker, poseLandmarker, activeTab, selEyewear, selTop, selBottom]);

  const accentColor = selected.accent ?? '#a855f7';

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* ── Flash ── */}
      {flash && <div className="fixed inset-0 z-[999] bg-white/40 pointer-events-none" />}

      {/* ── Full-screen Camera ── */}
      <div className={`absolute inset-0 transition-all duration-700 ${showBefore ? 'translate-x-[50%]' : ''}`}>
        <Webcam ref={webcamRef} audio={false} mirrored={true} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      
      {/* ── Before Side (Static Mirror) ── */}
      {showBefore && (
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-white/20 overflow-hidden z-0 bg-black">
          <Webcam audio={false} mirrored={true} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[30%]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 font-black text-6xl uppercase tracking-widest pointer-events-none rotate-[-15deg]">Original</div>
        </div>
      )}

      <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full object-cover z-10 pointer-events-none transition-all duration-700 ${showBefore ? 'translate-x-[50%]' : ''}`} />

      {/* ── Mirror Decorative Elements ── */}
      <div className="absolute inset-0 z-25 pointer-events-none">
        <MirrorFrame accent={accentColor} isLoaded={isLoaded} />
      </div>

      {/* ── Try Yours On Badge (Commercial Style) ── */}
      {showBefore && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <button onClick={() => setShowBefore(false)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-black text-sm shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center gap-2">
            <Zap size={16} fill="white" /> TRY YOURS ON
          </button>
        </div>
      )}

      {/* ── Bottom dark gradient ── */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)' }} />

      {/* ── Top gradient ── */}
      <div className="absolute inset-x-0 top-0 h-28 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 inset-x-0 z-30 px-5 pt-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-500 to-cyan-400 blur-sm opacity-80" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Zap size={16} className="text-white" />
            </div>
          </div>
          <div className="leading-none">
            <p className="text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-cyan-300">Aura Try-On</p>
            <p className="text-[9px] text-white/50 uppercase tracking-widest">AI Fitting Room</p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* AI status pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border text-[11px] font-bold ${isLoaded ? 'bg-black/40 border-emerald-400/30 text-emerald-400' : 'bg-black/40 border-amber-400/30 text-amber-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-bounce'}`} />
            {isLoaded ? 'AI Ready' : loadingStatus}
          </div>
          {/* Snapshot */}
          <button id="snapshot-btn" onClick={handleSnapshot} disabled={!isLoaded}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all disabled:opacity-40">
            <Camera size={16} className="text-white" />
          </button>
          {/* Before/After Toggle */}
          <button onClick={() => setShowBefore(!showBefore)}
            className={`w-9 h-9 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all active:scale-90 ${showBefore ? 'bg-white text-black border-transparent' : 'bg-black/40 border-white/20 text-white'}`}>
            <span className="text-[9px] font-black">{showBefore ? 'AFTER' : 'B/A'}</span>
          </button>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="absolute top-[72px] inset-x-0 z-30 flex justify-center gap-2 px-4">
        {([
          { t: 'eyewear' as Tab, label: 'Eyewear', icon: <Glasses size={13} /> },
          { t: 'tops' as Tab, label: 'Top Body', icon: <Shirt size={13} /> },
          { t: 'bottoms' as Tab, label: 'Bottoms', icon: <PersonStanding size={13} /> },
        ]).map(({ t, label, icon }) => (
          <button key={t} id={`tab-${t}`} onClick={() => setActiveTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-xl border transition-all active:scale-95 ${activeTab === t
              ? 'bg-white text-black border-transparent shadow-lg scale-[1.03]'
              : 'bg-black/30 border-white/20 text-white hover:bg-white/10'
              }`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── HINT ── */}
      {isLoaded && (
        <div className="absolute top-[120px] inset-x-0 z-30 flex justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-black/30 backdrop-blur-md border border-white/10 text-white/50">
            {activeTab === 'eyewear' ? '👓 Look straight at the camera' : activeTab === 'tops' ? '🧍 Step back — show your upper body' : '🧍 Step back — show your full body'}
          </span>
        </div>
      )}

      {/* ── BOTTOM PANEL ── */}
      <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-6 pt-2 flex flex-col gap-3">

        {/* Item strip */}
        <div ref={stripRef} className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
          {catalog.map((item: CatalogItem) => {
            const isSel = item.id === selId;
            return (
              <button key={item.id} onClick={() => setSelected(item)}
                style={{ scrollSnapAlign: 'start' }}
                className={`flex-shrink-0 w-[72px] flex flex-col items-center gap-1 group transition-all active:scale-90 ${isSel ? 'scale-105' : ''}`}>
                {/* Thumbnail circle */}
                <div className={`relative w-[60px] h-[60px] rounded-2xl flex items-center justify-center border-2 backdrop-blur-xl transition-all ${isSel ? 'border-white bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'border-white/25 bg-black/40 hover:border-white/60'
                  }`} style={isSel ? { boxShadow: `0 0 20px ${item.accent}66` } : {}}>
                  <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle,${item.accent}33 0%,transparent 70%)` }} />
                  <div className="relative z-10">
                    {activeTab === 'eyewear'
                      ? <Glasses size={26} strokeWidth={1.5} style={{ color: item.accent }} />
                      : activeTab === 'tops'
                        ? <Shirt size={26} strokeWidth={1.5} style={{ color: item.accent }} />
                        : <PersonStanding size={26} strokeWidth={1.5} style={{ color: item.accent }} />}
                  </div>
                  {isSel && (
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <Check size={9} className="text-black" strokeWidth={3} />
                    </div>
                  )}
                </div>
                {/* Label */}
                <span className={`text-[9px] font-semibold text-center leading-tight truncate w-full ${isSel ? 'text-white' : 'text-white/50'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product info card */}
        <div className="rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/12 p-4 flex flex-col gap-3"
          style={{ boxShadow: `0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)` }}>
          {/* Top row: name + price */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: accentColor, background: accentColor + '22' }}>
                  {selected.tag}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                  <Star size={9} fill="#f59e0b" /> 4.9
                </div>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">{selected.name}</h2>
              <p className="text-white/40 text-xs mt-0.5">
                {activeTab === 'eyewear' ? 'Eyewear' : activeTab === 'tops' ? 'Top Wear' : 'Bottom Wear'} · Free Delivery
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-white">${selected.price}</p>
              <p className="text-white/30 text-[10px] line-through">${Math.round(selected.price * 1.3)}</p>
            </div>
          </div>

          {/* Color dot row */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-medium">Color</span>
            {[accentColor, accentColor + 'aa', '#ffffff33', '#ffffff15'].map((c, i) => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 ${i === 0 ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c }} />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-white text-black hover:bg-gray-100 active:scale-95 transition-all shadow-lg">
              <Glasses size={15} /> Try On
            </button>
            <button className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`, boxShadow: `0 4px 20px ${accentColor}44` }}>
              <ShoppingBag size={15} className="text-black/70" /> Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
