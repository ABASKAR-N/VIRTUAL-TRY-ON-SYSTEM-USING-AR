// ─────────────────────────────────────────────────────────────────────────────
// AR Renderer — All canvas drawing functions for the Virtual Try-On system
// ─────────────────────────────────────────────────────────────────────────────

type P = { x: number; y: number };

// ── Glasses ────────────────────────────────────────────────────────────────
export function drawGlasses(
  ctx: CanvasRenderingContext2D,
  lm: P[],
  shape: string,
  frameColor: string,
  lensColor: string,
  accent: string,
  video?: HTMLVideoElement
) {
  // --- Hyper-Realistic AR Glasses Rendering (Library Version) ---
  const loOuter = lm[33], loInner = lm[133], roInner = lm[362], roOuter = lm[263], noseBridge = lm[168];
  if (!loOuter || !loInner || !roInner || !roOuter || !noseBridge) return;

  const lCx = (loOuter.x + loInner.x) / 2, lCy = (loOuter.y + loInner.y) / 2;
  const rCx = (roInner.x + roOuter.x) / 2, rCy = (roInner.y + roOuter.y) / 2;
  const lensW = Math.hypot(loOuter.x - loInner.x, loOuter.y - loInner.y) * 1.7;
  const lensH = lensW * (shape === 'shield' || shape === 'oversized' ? 0.58 : 0.68);
  const angle = Math.atan2(rCy - lCy, rCx - lCx);

  ctx.save();

  // 1. CAST SHADOW ON FACE (Ambient Occlusion)
  ctx.save();
  ctx.filter = 'blur(16px)';
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  const drawShadow = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy + 12);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, lensW / 1.7, lensH / 1.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  drawShadow(lCx, lCy);
  drawShadow(rCx, rCy);
  ctx.restore();

  const lens = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const definePath = () => {
      ctx.beginPath();
      switch (shape) {
        case 'round': ctx.ellipse(0, 0, lensW / 2, lensH / 2, 0, 0, Math.PI * 2); break;
        case 'cateye':
          ctx.moveTo(-lensW / 2, lensH / 4);
          ctx.bezierCurveTo(-lensW / 2, -lensH / 2, 0, -lensH / 2, lensW / 2, -lensH / 1.2);
          ctx.lineTo(lensW / 2, lensH / 4);
          ctx.quadraticCurveTo(0, lensH / 1.4, -lensW / 2, lensH / 4);
          break;
        case 'aviator':
          ctx.moveTo(-lensW * 0.42, -lensH / 2);
          ctx.lineTo(lensW * 0.42, -lensH / 2);
          ctx.quadraticCurveTo(lensW / 2, 0, lensW * 0.22, lensH / 2);
          ctx.quadraticCurveTo(0, lensH / 1.5, -lensW * 0.32, lensH / 2);
          ctx.quadraticCurveTo(-lensW / 2, 0, -lensW * 0.42, -lensH / 2);
          break;
        case 'shield': ctx.roundRect(-lensW / 2, -lensH / 2, lensW, lensH, [2, 2, lensH / 2, lensH / 2]); break;
        case 'hex':
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            if (i === 0) ctx.moveTo(Math.cos(a) * lensW / 2, Math.sin(a) * lensH / 2);
            else ctx.lineTo(Math.cos(a) * lensW / 2, Math.sin(a) * lensH / 2);
          }
          break;
        case 'rimless': ctx.ellipse(0, 0, lensW / 2, lensH / 2.3, 0, 0, Math.PI * 2); break;
        case 'oversized': ctx.roundRect(-lensW / 2, -lensH / 2, lensW, lensH, 15); break;
        default: ctx.roundRect(-lensW / 2, -lensH / 2, lensW, lensH, 12);
      }
      ctx.closePath();
    };

    // 2. GLASS MAGNIFICATION (Refraction)
    if (video) {
      ctx.save();
      definePath();
      ctx.clip();
      const zoom = 1.05;
      const vw = video.videoWidth, vh = video.videoHeight;
      const cw = ctx.canvas.width, ch = ctx.canvas.height;
      const normCx = cx / cw, normCy = cy / ch;
      const sw = (lensW / cw) * vw / zoom, sh = (lensH / ch) * vh / zoom;
      const sx = (1 - normCx) * vw - sw / 2, sy = normCy * vh - sh / 2;
      ctx.save();
      ctx.scale(-1, 1); 
      ctx.drawImage(video, sx, sy, sw, sh, -lensW / 2, -lensH / 2, lensW, lensH);
      ctx.restore();
      ctx.restore();
    }

    // 3. LENS MATERIAL
    definePath();
    const glassGrad = ctx.createRadialGradient(0, 0, lensW * 0.2, 0, 0, lensW * 0.6);
    glassGrad.addColorStop(0, lensColor);
    glassGrad.addColorStop(1, accent + '55');
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // 4. CHROMATIC ABERRATION
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ff3b30'; 
    definePath();
    ctx.stroke();
    ctx.translate(1.5, 0);
    ctx.strokeStyle = '#007aff'; 
    definePath();
    ctx.stroke();
    ctx.restore();

    // 5. ENVIRONMENTAL REFLECTION
    ctx.save();
    ctx.clip();
    const reflGrad = ctx.createLinearGradient(-lensW / 2, -lensH / 2, lensW / 2, lensH / 2);
    reflGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
    reflGrad.addColorStop(0.1, 'rgba(255,255,255,0.1)');
    reflGrad.addColorStop(0.4, 'transparent');
    reflGrad.addColorStop(0.9, 'rgba(255,255,255,0.15)');
    reflGrad.addColorStop(1, 'rgba(255,255,255,0.3)');
    ctx.fillStyle = reflGrad;
    ctx.fill();
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.roundRect(-lensW/3.5, -lensH/2.5, lensW/7, lensH/4, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
    ctx.restore();

    // 6. FRAME DEPTH
    if (shape !== 'rimless') {
      ctx.lineWidth = 6;
      ctx.strokeStyle = frameColor;
      ctx.lineJoin = 'round';
      definePath();
      ctx.stroke();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      definePath();
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.stroke();
      ctx.save();
      ctx.clip();
      ctx.lineWidth = 14;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(-lensW, -lensH / 1.8);
      ctx.lineTo(lensW, -lensH / 1.8);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      definePath();
      ctx.stroke();
    }
    ctx.restore();
  };

  lens(lCx, lCy);
  lens(rCx, rCy);

  // 7. NOSE PADS
  const drawPad = (x: number, y: number, side: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + (side * 0.4));
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };
  drawPad(noseBridge.x - 10, noseBridge.y + 10, -1);
  drawPad(noseBridge.x + 10, noseBridge.y + 10, 1);

  // 8. BRIDGE
  ctx.beginPath();
  ctx.moveTo(loInner.x, loInner.y);
  ctx.quadraticCurveTo(noseBridge.x, noseBridge.y - 8, roInner.x, roInner.y);
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(noseBridge.x - 6, noseBridge.y - 9);
  ctx.lineTo(noseBridge.x + 6, noseBridge.y - 9);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 9. TEMPLE ARMS
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = frameColor;
  ctx.beginPath();
  ctx.moveTo(loOuter.x, loOuter.y);
  ctx.bezierCurveTo(loOuter.x - 50, loOuter.y - 15, loOuter.x - 70, loOuter.y + 30, loOuter.x - 90, loOuter.y + 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(roOuter.x, roOuter.y);
  ctx.bezierCurveTo(roOuter.x + 50, roOuter.y - 15, roOuter.x + 70, roOuter.y + 30, roOuter.x + 90, roOuter.y + 50);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}


// ── Top Wear ────────────────────────────────────────────────────────────────
export function drawTopWear(
  ctx: CanvasRenderingContext2D,
  ls: P, rs: P, lh: P, rh: P,
  color: string, accent: string
) {
  const topY = (ls.y + rs.y) / 2;
  const cx = (ls.x + rs.x) / 2;
  const sw = Math.hypot(rs.x - ls.x, rs.y - ls.y);
  const arm = sw * 0.58;
  const hipY = (lh.y + rh.y) / 2;
  const bodyH = hipY - topY;
  const nw = sw * 0.18;
  const nd = bodyH * 0.18;

  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';

  const fabricGrad = ctx.createLinearGradient(ls.x - arm, 0, rs.x + arm, 0);
  fabricGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
  fabricGrad.addColorStop(0.13, color);
  fabricGrad.addColorStop(0.5, accent + 'cc');
  fabricGrad.addColorStop(0.87, color);
  fabricGrad.addColorStop(1, 'rgba(0,0,0,0.5)');

  // Fabric texture lines
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < bodyH; i += 5) {
    ctx.beginPath();
    ctx.moveTo(ls.x - arm * 0.9, topY + i);
    ctx.lineTo(rs.x + arm * 0.9, topY + i);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }
  ctx.restore();

  // Soft edge feathering
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.filter = 'blur(6px)';
  ctx.beginPath();
  ctx.moveTo(cx + nw * 1.08, topY - 2);
  ctx.lineTo(rs.x + arm * 0.13, topY - bodyH * 0.06);
  ctx.lineTo(rs.x + arm * 1.05, topY + bodyH * 0.04);
  ctx.lineTo(rs.x + arm * 0.85, topY + bodyH * 0.34);
  ctx.lineTo(rs.x * 0.92 + cx * 0.08, topY + bodyH * 0.37);
  ctx.lineTo(rs.x * 0.55 + cx * 0.45, hipY + 2);
  ctx.lineTo(ls.x * 0.55 + cx * 0.45, hipY + 2);
  ctx.lineTo(ls.x * 0.92 + cx * 0.08, topY + bodyH * 0.37);
  ctx.lineTo(ls.x - arm * 0.85, topY + bodyH * 0.34);
  ctx.lineTo(ls.x - arm * 1.05, topY + bodyH * 0.04);
  ctx.lineTo(ls.x - arm * 0.13, topY - bodyH * 0.06);
  ctx.lineTo(cx - nw * 1.08, topY - 2);
  ctx.quadraticCurveTo(cx, topY + nd * 1.7, cx + nw * 1.08, topY - 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // Main garment body
  ctx.beginPath();
  ctx.moveTo(cx + nw, topY);
  ctx.lineTo(rs.x + arm * 0.12, topY - bodyH * 0.04);
  ctx.lineTo(rs.x + arm, topY + bodyH * 0.02);
  ctx.lineTo(rs.x + arm * 0.8, topY + bodyH * 0.32);
  ctx.lineTo(rs.x * 0.92 + cx * 0.08, topY + bodyH * 0.35);
  ctx.lineTo(rs.x * 0.55 + cx * 0.45, hipY);
  ctx.lineTo(ls.x * 0.55 + cx * 0.45, hipY);
  ctx.lineTo(ls.x * 0.92 + cx * 0.08, topY + bodyH * 0.35);
  ctx.lineTo(ls.x - arm * 0.8, topY + bodyH * 0.32);
  ctx.lineTo(ls.x - arm, topY + bodyH * 0.02);
  ctx.lineTo(ls.x - arm * 0.12, topY - bodyH * 0.04);
  ctx.lineTo(cx - nw, topY);
  ctx.quadraticCurveTo(cx, topY + nd * 1.5, cx + nw, topY);
  ctx.closePath();

  ctx.fillStyle = fabricGrad;
  ctx.globalAlpha = 0.96;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.7;
  ctx.stroke();

  // Collar/neck detail
  ctx.beginPath();
  ctx.moveTo(cx - nw, topY);
  ctx.quadraticCurveTo(cx, topY + nd * 1.8, cx + nw, topY);
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Seam line (center front placket)
  ctx.beginPath();
  ctx.moveTo(cx, topY + nd);
  ctx.lineTo(cx, hipY);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Light highlight
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.ellipse(cx - nw * 0.7, topY + nd * 0.7, arm * 0.7, nd * 1.2, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ── Bottom Wear ─────────────────────────────────────────────────────────────
export function drawBottomWear(
  ctx: CanvasRenderingContext2D,
  lh: P, rh: P, lk: P, rk: P, la: P, ra: P,
  color: string, accent: string, style: string
) {
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';

  const hipMidX = (lh.x + rh.x) / 2;
  const hipMidY = (lh.y + rh.y) / 2;
  const hipW = Math.hypot(rh.x - lh.x, rh.y - lh.y) * 1.1;
  const leftX = Math.min(lh.x, rh.x) - hipW * 0.8;
  const rightX = Math.max(lh.x, rh.x) + hipW * 0.8;
  // Fix: define bodyH used for fabric texture
  const kneeY = (lk.y + rk.y) / 2;
  const anklY = (la.y + ra.y) / 2;
  const bodyH = Math.max(kneeY, anklY) - hipMidY;

  const fabricGrad = ctx.createLinearGradient(leftX, 0, rightX, 0);
  fabricGrad.addColorStop(0, 'rgba(0,0,0,0.52)');
  fabricGrad.addColorStop(0.16, color);
  fabricGrad.addColorStop(0.5, accent + 'cc');
  fabricGrad.addColorStop(0.84, color);
  fabricGrad.addColorStop(1, 'rgba(0,0,0,0.52)');

  // Fabric texture (vertical lines)
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < hipW * 2; i += 5) {
    ctx.beginPath();
    ctx.moveTo(leftX + i, hipMidY - 8);
    ctx.lineTo(leftX + i, hipMidY + bodyH + 18);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }
  ctx.restore();

  const applyMaterial = (mainPath: () => void) => {
    // Soft edge
    ctx.save();
    ctx.globalAlpha = 0.19;
    ctx.filter = 'blur(6px)';
    mainPath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    // Main shape
    ctx.save();
    mainPath();
    ctx.fillStyle = fabricGrad;
    ctx.globalAlpha = 0.97;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // Highlight
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.ellipse(hipMidX - hipW * 0.18, hipMidY + 18, hipW * 0.3, 16, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  };

  if (style === 'skirt') {
    const hemY = (lk.y + rk.y) / 2;
    const fl = hipW * 0.55;
    const skirtPath = () => {
      ctx.beginPath();
      ctx.moveTo(hipMidX - hipW / 2, hipMidY);
      ctx.quadraticCurveTo(hipMidX - hipW / 2 - fl * 0.4, (hipMidY + hemY) / 2, hipMidX - hipW / 2 - fl, hemY);
      ctx.lineTo(hipMidX + hipW / 2 + fl, hemY);
      ctx.quadraticCurveTo(hipMidX + hipW / 2 + fl * 0.4, (hipMidY + hemY) / 2, hipMidX + hipW / 2, hipMidY);
      ctx.closePath();
    };
    applyMaterial(skirtPath);
  } else {
    const bL = style === 'shorts' ? lk : la;
    const bR = style === 'shorts' ? rk : ra;
    const le = hipW * 0.08;

    const leftLeg = () => {
      ctx.beginPath();
      ctx.moveTo(hipMidX - hipW * 0.05, hipMidY);
      ctx.lineTo(lh.x - hipW * 0.05, lh.y);
      ctx.lineTo(lh.x - hipW * 0.5, lh.y);
      ctx.lineTo(bL.x - le, bL.y);
      ctx.lineTo(bL.x + le, bL.y);
      ctx.closePath();
    };

    const rightLeg = () => {
      ctx.beginPath();
      ctx.moveTo(hipMidX + hipW * 0.05, hipMidY);
      ctx.lineTo(rh.x + hipW * 0.05, rh.y);
      ctx.lineTo(rh.x + hipW * 0.5, rh.y);
      ctx.lineTo(bR.x + le, bR.y);
      ctx.lineTo(bR.x - le, bR.y);
      ctx.closePath();
    };

    applyMaterial(leftLeg);
    applyMaterial(rightLeg);

    // Waistband
    ctx.beginPath();
    ctx.roundRect(lh.x - hipW * 0.5, hipMidY - 12, hipW, 16, 4);
    const wbGrad = ctx.createLinearGradient(lh.x - hipW * 0.5, 0, lh.x + hipW * 0.5, 0);
    wbGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
    wbGrad.addColorStop(0.5, color);
    wbGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = wbGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

// ── Outfit (combined top + bottom) ─────────────────────────────────────────
export function drawOutfit(
  ctx: CanvasRenderingContext2D,
  poseLm: P[],
  topColor: string, topAccent: string,
  bottomColor: string, bottomAccent: string, bottomStyle: string,
  px: (l: { x: number; y: number }) => P
) {
  const lm = poseLm;
  if (lm[11] && lm[12] && lm[23] && lm[24]) {
    drawTopWear(ctx, px(lm[11]), px(lm[12]), px(lm[23]), px(lm[24]), topColor, topAccent);
  }
  if (lm[23] && lm[24] && lm[25] && lm[26] && lm[27] && lm[28]) {
    drawBottomWear(ctx, px(lm[23]), px(lm[24]), px(lm[25]), px(lm[26]), px(lm[27]), px(lm[28]), bottomColor, bottomAccent, bottomStyle);
  }
}

// ── Skeleton overlay (debug / decoration) ──────────────────────────────────
export function drawSkeletonDots(ctx: CanvasRenderingContext2D, lm: P[], accent: string) {
  const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  ctx.save();
  keyPoints.forEach(i => {
    if (!lm[i]) return;
    ctx.beginPath();
    ctx.arc(lm[i].x, lm[i].y, 4, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.7;
    ctx.fill();
  });
  ctx.restore();
}
