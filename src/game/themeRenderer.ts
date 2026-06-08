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
  playerCx?: number; // 캐릭터 중심 x (눈길 자국용)
  playerY?: number;  // 캐릭터 발 y
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
    case 'bamboo':  renderBamboo(rc); break;
    case 'stars':   renderStars(rc);   break;
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

// 🌸 벚꽃 (가지 + 꽃 + 꽃잎 낙화)
function renderPetals(rc: RenderCtx) {
  const { ctx, pathLeft, pathWidth, height, width, scrollY, aliveTime } = rc;
  const rightEdge = pathLeft + pathWidth;

  // ── 벚꽃 가지 ──
  const branchPeriod = 180;
  const branchWorld = Math.floor(scrollY / branchPeriod);
  for (let i = 0; i <= Math.ceil((height + branchPeriod * 2) / branchPeriod); i++) {
    const slot = branchWorld + i;
    const y = (scrollY % branchPeriod) - branchPeriod + i * branchPeriod;
    const sway = Math.sin(aliveTime * 0.4 + slot * 0.8) * 2.5;
    drawCherryBranch(ctx, 0,     y,                       pathLeft,  sway,  true,  slot);
    drawCherryBranch(ctx, width, y + branchPeriod * 0.5,  rightEdge, sway,  false, slot + 3);
  }

  // ── 꽃잎 낙화 (좌우 사이드 + 길 안쪽까지 날림) ──
  const period = 38;
  const world = Math.floor(scrollY / period);
  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    for (let j = 0; j < 4; j++) {
      // 좌측: 사이드 ~ 길 안쪽 40px
      const lx = stableX(slot, j * 2,     2, pathLeft + 40);
      // 우측: 길 안쪽 40px 왼쪽부터 ~ 오른쪽 끝
      const rx = rightEdge - 40 + stableX(slot, j * 2 + 1, 0, width - (rightEdge - 40) - 4);
      const drift  = Math.sin(aliveTime * 0.55 + slot * 0.5 + j) * 5;
      const spin   = Math.sin(slot * 0.9 + j) * 0.5;
      const alpha  = 0.45 + Math.abs(Math.sin(slot * 0.7 + j)) * 0.35;
      const colors = ['rgba(255,182,200,', 'rgba(255,210,220,', 'rgba(255,230,235,'];
      const col    = colors[(Math.abs(slot) + j) % colors.length];

      ctx.save();
      ctx.translate(lx + drift, y + j * (period / 4));
      ctx.rotate(spin);
      ctx.fillStyle = `${col}${alpha})`;
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(rx - drift, y + j * (period / 4) + period * 0.5);
      ctx.rotate(-spin);
      ctx.fillStyle = `${col}${alpha})`;
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
}

function drawCherryBranch(
  ctx: CanvasRenderingContext2D,
  edgeX: number, // 화면 가장자리 x (0 = 좌, width = 우)
  baseY: number,
  pathEdgeX: number, // pathLeft 또는 rightEdge
  sway: number,
  isLeft: boolean,
  slot: number,
) {
  const dir  = isLeft ? 1 : -1; // 가지가 뻗는 방향
  const branchLen = Math.abs(pathEdgeX - edgeX) + 12; // 길 안쪽 살짝만 오버행

  ctx.save();
  ctx.translate(edgeX, baseY);

  // 메인 줄기
  ctx.strokeStyle = '#7B4A2A';
  ctx.lineWidth   = 5;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.bezierCurveTo(
    dir * branchLen * 0.3, 15 + sway,
    dir * branchLen * 0.7, -10 + sway,
    dir * branchLen,       -30 + sway,
  );
  ctx.stroke();

  // 서브 가지 1
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#8B5A3A';
  ctx.beginPath();
  ctx.moveTo(dir * branchLen * 0.45, 5 + sway * 0.5);
  ctx.bezierCurveTo(
    dir * branchLen * 0.55, -15 + sway,
    dir * branchLen * 0.65, -25 + sway,
    dir * branchLen * 0.7,  -38 + sway,
  );
  ctx.stroke();

  // 서브 가지 2
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(dir * branchLen * 0.7, -10 + sway);
  ctx.bezierCurveTo(
    dir * branchLen * 0.78, -5  + sway,
    dir * branchLen * 0.85,  5  + sway,
    dir * branchLen * 0.88,  14 + sway,
  );
  ctx.stroke();

  // 꽃 클러스터
  const flowerPositions = [
    { t: 0.55, x: dir * branchLen * 0.55, y: -10 + sway, count: 3 },
    { t: 0.85, x: dir * branchLen,        y: -30 + sway, count: 5 },
    { t: 0.72, x: dir * branchLen * 0.7,  y: -38 + sway, count: 4 },
    { t: 0.88, x: dir * branchLen * 0.88, y: 14 + sway,  count: 3 },
  ];

  for (const fp of flowerPositions) {
    const spread = 10 + Math.abs(Math.sin(slot * 1.3 + fp.t * 5)) * 6;
    for (let k = 0; k < fp.count; k++) {
      const angle  = (k / fp.count) * Math.PI * 2;
      const radius = spread * 0.55;
      const fx     = fp.x + Math.cos(angle) * radius;
      const fy     = fp.y + Math.sin(angle) * radius * 0.7;
      drawCherryFlower(ctx, fx, fy, slot + k);
    }
    drawCherryFlower(ctx, fp.x, fp.y, slot); // 중심 꽃
  }

  ctx.restore();
}

function drawCherryFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number) {
  const petalCols = ['#FFB7C5', '#FFCCD5', '#FFE4EC', '#FFA0B8'];
  ctx.fillStyle = petalCols[Math.abs(seed) % petalCols.length];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(a) * 3.5,
      cy + Math.sin(a) * 3.5,
      3.2, 2, a, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = '#FFE566';
  ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2); ctx.fill();
}

// ❄️ 눈길 (눈 자국 선 + 눈송이)
function renderSnow(rc: RenderCtx) {
  const { ctx, width, height, scrollY, aliveTime, playerCx, playerY } = rc;

  // ── 캐릭터 뒤 눈 자국 선 (캐릭터 발 아래 → 화면 하단으로 사라짐) ──
  if (playerCx !== undefined && playerY !== undefined) {
    const trailGrad = ctx.createLinearGradient(0, playerY, 0, height);
    trailGrad.addColorStop(0,   'rgba(140,170,200,0.5)');
    trailGrad.addColorStop(0.5, 'rgba(160,185,210,0.2)');
    trailGrad.addColorStop(1,   'rgba(160,185,210,0)');

    ctx.save();
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    // 좌측 자국
    ctx.beginPath();
    ctx.moveTo(playerCx - 7, playerY);
    ctx.lineTo(playerCx - 7, height);
    ctx.stroke();
    // 우측 자국
    ctx.beginPath();
    ctx.moveTo(playerCx + 7, playerY);
    ctx.lineTo(playerCx + 7, height);
    ctx.stroke();
    ctx.restore();
  }

  // ── 눈송이 낙하 ──
  const period = 52;
  const world = Math.floor(scrollY / period);
  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    for (let j = 0; j < 4; j++) {
      const x = stableX(slot, j * 2, 8, width - 16);
      const drift = Math.sin(aliveTime * 0.5 + slot * 0.4 + j) * 4;
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

// 🎋 대나무숲길 (흔들리는 기둥 + 사이드 잎 + 허공 낙엽)
function renderBamboo(rc: RenderCtx) {
  const { ctx, width, pathLeft, pathWidth, height, scrollY, aliveTime } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 72;
  const world = Math.floor(scrollY / period);

  // 대나무 기둥 — 바람에 살랑 흔들림
  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    const sway1 = Math.sin(aliveTime * 1.1 + slot * 0.4) * 2.5;
    const sway2 = Math.sin(aliveTime * 0.9 + slot * 0.6 + 1) * 2.5;
    drawBambooStalk(ctx, pathLeft - 10 + sway1, y, period);
    drawBambooStalk(ctx, pathLeft - 22 + sway2, y + period * 0.5 + (Math.abs(slot) % 2) * 8, period);
    drawBambooStalk(ctx, rightEdge + 10 - sway1, y + period * 0.25, period);
    drawBambooStalk(ctx, rightEdge + 22 - sway2, y + period * 0.72, period);
  }

  // 사이드 잎 (위아래 흐름)
  const leafPeriod = 44;
  const leafWorld = Math.floor(scrollY / leafPeriod);
  const lRange = Math.max(0, pathLeft - 8);
  const rRange = Math.max(0, width - rightEdge - 8);
  for (let i = 0; i <= Math.ceil((height + leafPeriod * 2) / leafPeriod); i++) {
    const slot = leafWorld + i;
    const y = (scrollY % leafPeriod) - leafPeriod + i * leafPeriod;
    for (let j = 0; j < 2; j++) {
      const drift = Math.sin(aliveTime * 0.8 + slot * 0.5 + j * 1.3) * 5;
      const angle = Math.sin(aliveTime * 0.6 + slot * 0.7 + j) * 0.55;
      const alpha = 0.5 + Math.abs(Math.sin(slot * 0.9 + j * 1.2)) * 0.35;
      const lx = stableX(slot, j * 4, 3, lRange) + drift;
      const rx = rightEdge + 3 + stableX(slot, j * 4 + 2, 0, rRange) - drift;
      drawBambooLeaf(ctx, lx, y + j * (leafPeriod / 2), angle, alpha, 11, 3.5);
      drawBambooLeaf(ctx, rx, y + j * (leafPeriod / 2) + leafPeriod * 0.5, -angle, alpha, 11, 3.5);
    }
  }

  // 큼직한 잎 몇 장 — 화면을 가로질러 떨어짐
  const floatPeriod = 120;
  const floatWorld = Math.floor(scrollY / floatPeriod);
  for (let i = 0; i <= Math.ceil((height + floatPeriod * 2) / floatPeriod); i++) {
    const slot = floatWorld + i;
    const y = (scrollY % floatPeriod) - floatPeriod + i * floatPeriod;
    for (let j = 0; j < 3; j++) {
      const baseX = stableX(slot, j * 5, pathLeft + 10, pathWidth - 20);
      const drift = Math.sin(aliveTime * 0.5 + slot * 0.3 + j * 2) * 18;
      const angle = Math.sin(aliveTime * 0.4 + slot * 0.5 + j) * 0.8;
      const alpha = 0.55 + Math.abs(Math.sin(slot * 0.7 + j)) * 0.3;
      drawBambooLeaf(ctx, baseX + drift, y + j * (floatPeriod / 3), angle, alpha, 16, 5);
    }
  }
}

function drawBambooStalk(ctx: CanvasRenderingContext2D, cx: number, cy: number, segH: number) {
  const w = 7;
  ctx.fillStyle = '#4A8A3A';
  ctx.fillRect(cx - w / 2, cy, w, segH);
  ctx.fillStyle = '#3A7A2A';
  ctx.fillRect(cx - w / 2 - 1, cy + segH * 0.5, w + 2, 3);
  ctx.fillStyle = '#6AAA5A';
  ctx.fillRect(cx - w / 2 + 1, cy + 2, 2, segH - 4);
}

function drawBambooLeaf(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, alpha: number, rx = 9, ry = 3) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#5A9A40';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(30,80,20,${alpha * 0.5})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-rx, 0); ctx.lineTo(rx, 0); ctx.stroke();
  ctx.restore();
}

// 🌙 달빛길 별 (전체 너비 — 반짝이는 별 + 유성 효과)
function renderStars(rc: RenderCtx) {
  const { ctx, width, height, pathLeft, pathWidth, scrollY, aliveTime } = rc;
  const rightEdge = pathLeft + pathWidth;
  const period = 60;
  const world = Math.floor(scrollY / period);

  // 배경 별들 (전체)
  for (let i = 0; i <= Math.ceil((height + period * 2) / period); i++) {
    const slot = world + i;
    const y = (scrollY % period) - period + i * period;
    for (let j = 0; j < 5; j++) {
      const x = stableX(slot, j * 3, 4, width - 8);
      const twinkle = 0.4 + Math.abs(Math.sin(aliveTime * 2.2 + slot * 1.1 + j * 0.7)) * 0.6;
      const size = 1.2 + (Math.abs(slot + j) % 3) * 0.8;
      ctx.fillStyle = `rgba(220,220,255,${twinkle})`;
      ctx.beginPath();
      ctx.arc(x, y + j * (period / 5), size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 사이드 집중 반짝이 (좌우 잔디 구역)
  const sidePeriod = 38;
  const sideWorld = Math.floor(scrollY / sidePeriod);
  for (let i = 0; i <= Math.ceil((height + sidePeriod * 2) / sidePeriod); i++) {
    const slot = sideWorld + i;
    const y = (scrollY % sidePeriod) - sidePeriod + i * sidePeriod;
    for (let j = 0; j < 3; j++) {
      const twinkle = 0.5 + Math.abs(Math.sin(aliveTime * 3.5 + slot * 1.7 + j * 2.1)) * 0.5;
      const size = 2 + (Math.abs(slot * 2 + j) % 3);
      // 좌측 사이드
      const lx = stableX(slot, j * 4, 4, pathLeft - 8);
      // 우측 사이드
      const rx = rightEdge + 4 + stableX(slot, j * 4 + 2, 0, width - rightEdge - 8);
      drawSparkle(ctx, lx, y + j * (sidePeriod / 3), size, twinkle);
      drawSparkle(ctx, rx, y + j * (sidePeriod / 3) + sidePeriod * 0.5, size, twinkle);
    }
  }

  // 큰 별 (십자 모양) — 사이드 위주
  const bigPeriod = 90;
  const bigWorld = Math.floor(scrollY / bigPeriod);
  for (let i = 0; i <= Math.ceil((height + bigPeriod * 2) / bigPeriod); i++) {
    const slot = bigWorld + i;
    const y = (scrollY % bigPeriod) - bigPeriod + i * bigPeriod;
    const twinkle = 0.6 + Math.abs(Math.sin(aliveTime * 1.4 + slot * 0.9)) * 0.4;
    const lx = stableX(slot, 5, 6, pathLeft - 12);
    const rx = rightEdge + 6 + stableX(slot, 9, 0, width - rightEdge - 12);
    drawBigStar(ctx, lx, y, 6, twinkle);
    drawBigStar(ctx, rx, y + bigPeriod * 0.5, 6, twinkle);
  }

  // 유성 (가끔 스치듯)
  const meteorPhase = (aliveTime * 0.4) % 1;
  if (meteorPhase < 0.18) {
    const t = meteorPhase / 0.18;
    const mx = width * 0.2 + t * width * 0.5;
    const my = height * 0.1 + t * height * 0.25;
    const alpha = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
    ctx.save();
    const grad = ctx.createLinearGradient(mx - 30, my - 15, mx, my);
    grad.addColorStop(0, `rgba(180,180,255,0)`);
    grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.8})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx - 30, my - 15);
    ctx.lineTo(mx, my);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  // 십자 광선
  ctx.strokeStyle = `rgba(255,240,180,${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - r * 2, cy); ctx.lineTo(cx + r * 2, cy);
  ctx.moveTo(cx, cy - r * 2); ctx.lineTo(cx, cy + r * 2);
  ctx.stroke();
  // 대각 광선 (짧게)
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r);
  ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r);
  ctx.stroke();
  // 중심 점
  ctx.fillStyle = `rgba(255,255,220,${alpha})`;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBigStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,200,${alpha})`;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(255,255,220,${alpha})`;
  ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
