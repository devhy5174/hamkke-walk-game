import type { GameTheme } from './themes';

export interface RenderCtx {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  pathLeft: number;
  pathWidth: number;
  isPowerMode: boolean;
  scrollY: number;
  aliveTime: number;
}

// ── 배경 (잔디 + 길 + 발자국 패턴 + 풀잎) ───────────────────────────────

export function renderBackground(rc: RenderCtx, theme: GameTheme): void {
  const { ctx, width, height, pathLeft, pathWidth, isPowerMode, scrollY } = rc;
  const { colors } = theme;
  const rightEdge = pathLeft + pathWidth;

  // 잔디
  ctx.fillStyle = colors.grassMain;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.grassInner;
  ctx.fillRect(0, 0, pathLeft - 6, height);
  ctx.fillRect(rightEdge + 6, 0, width - rightEdge - 6, height);

  // 산책길
  ctx.fillStyle = isPowerMode ? colors.pathPower : colors.pathBase;
  ctx.fillRect(pathLeft, 0, pathWidth, height);
  ctx.fillStyle = colors.pathEdge;
  ctx.fillRect(pathLeft, 0, 6, height);
  ctx.fillRect(rightEdge - 6, 0, 6, height);

  // 발자국 패턴 (길 중앙)
  const sp = 54;
  ctx.fillStyle = colors.stepPattern;
  for (let i = 0; i <= Math.ceil((height + sp * 2) / sp); i++) {
    const y = (scrollY % sp) - sp + i * sp;
    ctx.beginPath(); ctx.ellipse(width / 2 - 13, y, 5, 8, -0.18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(width / 2 + 13, y + sp / 2, 5, 8, 0.18, 0, Math.PI * 2); ctx.fill();
  }

  // 풀잎 (사이드)
  ctx.strokeStyle = colors.tuft;
  ctx.lineWidth = 2;
  const tp = 48;
  for (let i = 0; i <= Math.ceil((height + tp * 2) / tp); i++) {
    const y = (scrollY % tp) - tp + i * tp;
    drawGrassTuft(ctx, pathLeft - 14, y);
    drawGrassTuft(ctx, rightEdge + 14, y);
  }

  // ── 깊이감: 길 중앙 밝게 / 가장자리 어둡게 ──
  const depthGrad = ctx.createLinearGradient(pathLeft, 0, pathLeft + pathWidth, 0);
  depthGrad.addColorStop(0,    'rgba(0,0,0,0.07)');
  depthGrad.addColorStop(0.18, 'rgba(0,0,0,0.02)');
  depthGrad.addColorStop(0.5,  'rgba(255,255,255,0.05)');
  depthGrad.addColorStop(0.82, 'rgba(0,0,0,0.02)');
  depthGrad.addColorStop(1,    'rgba(0,0,0,0.07)');
  ctx.fillStyle = depthGrad;
  ctx.fillRect(pathLeft, 0, pathWidth, height);

  // ── 흙길 질감: 작은 자갈/흙 입자 ──
  const pebblePeriod = 38;
  const world = Math.floor(scrollY / pebblePeriod);
  for (let i = 0; i <= Math.ceil((height + pebblePeriod * 2) / pebblePeriod); i++) {
    const slot = world + i;
    const y = (scrollY % pebblePeriod) - pebblePeriod + i * pebblePeriod;
    for (let j = 0; j < 5; j++) {
      const px = pathLeft + 10 + Math.abs(Math.sin(slot * 1.9 + j * 2.3)) * (pathWidth - 20);
      const pr = 1.2 + Math.abs(Math.sin(slot * 0.7 + j * 1.1)) * 1.4;
      ctx.fillStyle = `rgba(120,90,55,${0.08 + Math.abs(Math.sin(slot * 2 + j)) * 0.07})`;
      ctx.beginPath();
      ctx.ellipse(px, y + j * 7, pr, pr * 0.55, Math.sin(slot + j) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGrassTuft(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + 5); ctx.lineTo(cx - 5, cy - 6);
  ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy - 8);
  ctx.moveTo(cx, cy + 5); ctx.lineTo(cx + 5, cy - 6);
  ctx.stroke();
}

// ── 테마별 장식 ─────────────────────────────────────────────────────────

export function renderDecorations(rc: RenderCtx, theme: GameTheme): void {
  switch (theme.decoration) {
    case 'flowers': renderFlowers(rc); break;
    case 'trees':   renderTrees(rc);   break;
    case 'leaves':  renderLeaves(rc);  break;
    case 'petals':  renderPetals(rc);  break;
    case 'snow':    renderSnow(rc);    break;
    case 'rocks':   renderMountainRocks(rc); break;
  }
}

// slot 기반 안정 위치 계산 헬퍼
// slot은 행마다 고정된 정수 → x가 흔들리지 않음
function stableX(slot: number, seed: number, min: number, range: number): number {
  return min + Math.abs(Math.sin(slot * 2.1 + seed)) * range;
}

// 🌳 공원 꽃 (사이드 잔디에만)
function renderFlowers(rc: RenderCtx) {
  const { ctx, pathLeft, pathWidth, height, width, scrollY } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 56;
  const lRange = Math.max(0, pathLeft - 16);
  const rRange = Math.max(0, width - rightEdge - 16);
  const colors = ['#FFB6C1', '#FFD700', '#FFFFFF', '#FFC0CB'];

  const world = Math.floor(scrollY / period);
  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    drawFlower(ctx, stableX(slot, 0, 4, lRange), y, colors[Math.abs(slot) % colors.length]);
    drawFlower(ctx, stableX(slot, 1, 4, lRange), y + period * 0.5, colors[Math.abs(slot + 1) % colors.length]);
    drawFlower(ctx, rightEdge + 4 + stableX(slot, 2, 0, rRange), y + period * 0.2, colors[Math.abs(slot + 2) % colors.length]);
    drawFlower(ctx, rightEdge + 4 + stableX(slot, 3, 0, rRange), y + period * 0.7, colors[Math.abs(slot + 3) % colors.length]);
  }
}

function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#FFD700';
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
}

// 🌲 숲 소나무 (사이드에만)
function renderTrees(rc: RenderCtx) {
  const { ctx, pathLeft, pathWidth, height, scrollY } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 90;
  const world = Math.floor(scrollY / period);

  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    // 좌측 2그루 (겹치지 않게 앞뒤 배치)
    drawPineTree(ctx, pathLeft - 14, y);
    drawPineTree(ctx, pathLeft - 26, y + period * 0.5 + (Math.abs(slot) % 2) * 8);
    // 우측 2그루
    drawPineTree(ctx, rightEdge + 14, y + period * 0.25);
    drawPineTree(ctx, rightEdge + 26, y + period * 0.75);
  }
}

function drawPineTree(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#3D2B1F';
  ctx.fillRect(cx - 3, cy + 6, 6, 14);
  const layers: [number, number][] = [[16, 0], [13, 7], [10, 14]];
  for (const [w, dy] of layers) {
    ctx.fillStyle = dy === 0 ? '#1A3A28' : '#2D5A40';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22 + dy);
    ctx.lineTo(cx - w, cy + dy);
    ctx.lineTo(cx + w, cy + dy);
    ctx.closePath();
    ctx.fill();
  }
}

// 🍁 단풍 낙엽 (사이드 잔디에만)
function renderLeaves(rc: RenderCtx) {
  const { ctx, width, pathLeft, pathWidth, height, scrollY } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 42;
  const lRange = Math.max(0, pathLeft - 14);
  const rRange = Math.max(0, width - rightEdge - 14);
  const colors = ['#D2691E', '#FF6347', '#DAA520', '#FF8C00', '#CD853F'];
  const world = Math.floor(scrollY / period);

  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    for (let j = 0; j < 2; j++) {
      const lx = stableX(slot, j * 3, 4, lRange);
      const rx = rightEdge + 4 + stableX(slot, j * 3 + 1, 0, rRange);
      const angle = Math.sin(slot * 1.3 + j) * 0.6;
      drawLeaf(ctx, lx, y + j * (period / 2), colors[(Math.abs(slot) + j) % colors.length], angle);
      drawLeaf(ctx, rx, y + j * (period / 2) + 8, colors[(Math.abs(slot) + j + 2) % colors.length], -angle);
    }
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, angle: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// 🌸 벚꽃 꽃잎 (사이드 잔디 + 길 가장자리 — 부드럽게)
function renderPetals(rc: RenderCtx) {
  const { ctx, pathLeft, pathWidth, height, width, scrollY, aliveTime } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 44;
  // 꽃잎은 잔디와 길 가장자리에만 (pathLeft 안쪽 20px, rightEdge 바깥 20px)
  const lZone = pathLeft + 20;
  const rZoneStart = rightEdge - 20;
  const world = Math.floor(scrollY / period);

  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;

    for (let j = 0; j < 3; j++) {
      // 좌측 꽃잎 (0 ~ pathLeft+20)
      const lx = stableX(slot, j * 2, 2, lZone - 4);
      // 우측 꽃잎 (rightEdge-20 ~ width)
      const rx = rZoneStart + stableX(slot, j * 2 + 1, 0, width - rZoneStart - 4);
      const drift = Math.sin(aliveTime * 0.6 + slot * 0.5 + j) * 3; // 느린 표류
      const alpha = 0.5 + Math.sin(slot * 0.8 + j) * 0.2;

      ctx.save();
      ctx.translate(lx + drift, y + j * (period / 3));
      ctx.rotate(Math.sin(slot * 0.9 + j) * 0.4);
      ctx.fillStyle = `rgba(255,182,200,${alpha})`;
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(rx - drift, y + j * (period / 3) + 12);
      ctx.rotate(-Math.sin(slot * 0.9 + j) * 0.4);
      ctx.fillStyle = `rgba(255,200,215,${alpha})`;
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
}

// ❄️ 눈송이 (전체 너비 — 자연스럽게 내리는 느낌)
function renderSnow(rc: RenderCtx) {
  const { ctx, width, height, scrollY, aliveTime } = rc;
  const period = 52;
  const world = Math.floor(scrollY / period);

  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    for (let j = 0; j < 4; j++) {
      const x = stableX(slot, j * 2, 8, width - 16);
      const drift = Math.sin(aliveTime * 0.5 + slot * 0.4 + j) * 4; // 느린 좌우 흔들림
      const size = 5 + (Math.abs(slot + j) % 3) * 2;
      drawSnowflake(ctx, x + drift, y + j * (period / 4), size);
    }
  }
}

function drawSnowflake(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.strokeStyle = 'rgba(200,230,255,0.75)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(220,240,255,0.9)';
  ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
}

// ⛰️ 산 바위 (사이드에만)
function renderMountainRocks(rc: RenderCtx) {
  const { ctx, width, pathLeft, pathWidth, height, scrollY } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 72;
  const lRange = Math.max(0, pathLeft - 20);
  const rRange = Math.max(0, width - rightEdge - 20);
  const world = Math.floor(scrollY / period);

  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    const lx = stableX(slot, 0, 6, lRange);
    const rx = rightEdge + 6 + stableX(slot, 1, 0, rRange);
    const rw = 13 + (Math.abs(slot) % 3) * 3;
    const rh = 9 + (Math.abs(slot + 1) % 3) * 2;
    drawBoulder(ctx, lx, y, rw, rh);
    drawBoulder(ctx, rx, y + period * 0.5, rw - 2, rh - 1);
  }
}

function drawBoulder(ctx: CanvasRenderingContext2D, cx: number, cy: number, rw: number, rh: number) {
  ctx.fillStyle = '#7A7A6A';
  ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#AAAAAA';
  ctx.beginPath(); ctx.ellipse(cx - rw * 0.2, cy - rh * 0.3, rw * 0.4, rh * 0.4, -0.3, 0, Math.PI * 2); ctx.fill();
}
