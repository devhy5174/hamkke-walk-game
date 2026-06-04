import type {
  Player,
  Footprint,
  WaterBottle,
  Obstacle,
  GameStats,
  Milestone,
} from './types';
import {
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_Y_RATIO,
  ROAD_L, ROAD_R,
  FOOTPRINT_SPAWN_MS, FOOTPRINT_SCORE,
  WATER_BASE_SPEED, WATER_SPAWN_MS, POWER_SPEED_BOOST,
  OBSTACLE_BASE_SPEED, OBSTACLE_SPAWN_MS,
  GAUGE_CAPACITY, POWER_DURATION, POWER_SCORE_MULT,
  SPEED_RAMP, MILESTONES,
} from './constants';
import { makeFootprint, makeWaterBottle, makeObstacle } from './spawn';
import { hitFootprint, hitWaterBottle, hitObstacle } from './collision';
import { type GameTheme, THEMES, getThemeByDistance } from './themes';
import { renderBackground, renderDecorations } from './themeRenderer';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private player!: Player;
  private footprints: Footprint[] = [];
  private waterBottles: WaterBottle[] = [];
  private obstacles: Obstacle[] = [];

  private score = 0;
  private gaugeCount = 0;
  private isPowerMode = false;
  private powerTimeLeft = 0;

  private running = false;
  private rafId = 0;
  private prevTime = 0;
  private footprintTimer = 0;
  private waterTimer = 0;
  private obsTimer = 0;
  private aliveTime = 0;
  private scrollY = 0;

  private distanceMeters = 0;
  private nextDistanceScore = 10;
  private reachedMilestones = new Set<number>();
  private currentThemeId = THEMES[0].id;

  touchX: number | null = null;
  moveDx = 0;

  private onUpdate: (stats: GameStats) => void;
  private onGameOver: () => void;
  private onMilestone: (m: Milestone) => void;
  private onThemeChange: (theme: GameTheme) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onUpdate: (stats: GameStats) => void,
    onGameOver: () => void,
    onMilestone: (m: Milestone) => void,
    onThemeChange: (theme: GameTheme) => void,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onUpdate = onUpdate;
    this.onGameOver = onGameOver;
    this.onMilestone = onMilestone;
    this.onThemeChange = onThemeChange;
  }

  start() {
    this.stop();
    const { width, height } = this.canvas;
    this.player = {
      x: width / 2 - PLAYER_WIDTH / 2,
      y: height * PLAYER_Y_RATIO,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
    this.footprints = [];
    this.waterBottles = [];
    this.obstacles = [];
    this.score = 0;
    this.gaugeCount = 0;
    this.isPowerMode = false;
    this.powerTimeLeft = 0;
    this.footprintTimer = 0;
    this.waterTimer = 0;
    this.obsTimer = OBSTACLE_SPAWN_MS * 0.55;
    this.aliveTime = 0;
    this.scrollY = 0;
    this.distanceMeters = 0;
    this.nextDistanceScore = 10;
    this.reachedMilestones = new Set<number>();
    this.currentThemeId = THEMES[0].id;
    this.running = true;
    this.prevTime = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private emitUpdate() {
    this.onUpdate({
      score: this.score,
      gaugeCount: this.gaugeCount,
      distanceMeters: Math.floor(this.distanceMeters),
      isPowerMode: this.isPowerMode,
      powerTimeLeft: this.powerTimeLeft,
    });
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = this.prevTime ? Math.min(now - this.prevTime, 50) : 16;
    this.prevTime = now;
    this.update(dt / 1000);
    this.render();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private get speedMult(): number {
    return 1 + this.aliveTime * SPEED_RAMP;
  }

  private update(dtSec: number) {
    this.aliveTime += dtSec;
    const { width } = this.canvas;
    const sm = this.speedMult;
    const boost = this.isPowerMode ? POWER_SPEED_BOOST : 1; // 파워모드 전체 속도 배율
    const pathLeft = width * ROAD_L;
    const pathRight = width * ROAD_R;

    // 플레이어 이동 (파워모드 시 이동속도도 증가 → 거리 빨리 오름)
    const { player } = this;
    if (this.touchX !== null) {
      const target = Math.max(
        pathLeft,
        Math.min(this.touchX - player.width / 2, pathRight - player.width),
      );
      const delta = target - player.x;
      const maxStep = PLAYER_SPEED * 1.8 * sm * boost * dtSec;
      player.x += Math.sign(delta) * Math.min(Math.abs(delta), maxStep);
    } else if (this.moveDx !== 0) {
      player.x += this.moveDx * PLAYER_SPEED * sm * boost * dtSec;
      player.x = Math.max(
        pathLeft,
        Math.min(player.x, pathRight - player.width),
      );
    }

    // 파워모드 카운트다운
    if (this.isPowerMode) {
      const prevCeil = Math.ceil(this.powerTimeLeft);
      this.powerTimeLeft -= dtSec;
      if (this.powerTimeLeft <= 0) {
        this.isPowerMode = false;
        this.powerTimeLeft = 0;
        this.emitUpdate();
      } else if (Math.ceil(this.powerTimeLeft) !== prevCeil) {
        this.emitUpdate();
      }
    }

    // 배경 스크롤
    this.scrollY = (this.scrollY + WATER_BASE_SPEED * sm * boost * dtSec) % 60;

    // 거리 증가 + 거리 기반 점수
    const prevFloor = Math.floor(this.distanceMeters);
    this.distanceMeters += sm * boost * dtSec;
    let needsEmit = Math.floor(this.distanceMeters) !== prevFloor;

    while (this.distanceMeters >= this.nextDistanceScore) {
      this.score++;
      this.nextDistanceScore += 10;
      needsEmit = true;
    }
    if (needsEmit) this.emitUpdate();

    // 마일스톤 체크
    for (const m of MILESTONES) {
      if (
        !this.reachedMilestones.has(m.distance) &&
        this.distanceMeters >= m.distance
      ) {
        this.reachedMilestones.add(m.distance);
        this.onMilestone(m);
      }
    }

    // 테마 변경 감지
    const newTheme = getThemeByDistance(this.distanceMeters);
    if (newTheme.id !== this.currentThemeId) {
      this.currentThemeId = newTheme.id;
      this.onThemeChange(newTheme);
    }

    // 발자국 스폰
    this.footprintTimer += dtSec * 1000;
    if (this.footprintTimer >= FOOTPRINT_SPAWN_MS / sm) {
      this.footprintTimer = 0;
      this.footprints.push(makeFootprint(width));
    }

    // 물병 스폰
    this.waterTimer += dtSec * 1000;
    if (this.waterTimer >= WATER_SPAWN_MS / sm) {
      this.waterTimer = 0;
      this.waterBottles.push(makeWaterBottle(width));
    }

    // 장애물 스폰
    this.obsTimer += dtSec * 1000;
    if (this.obsTimer >= OBSTACLE_SPAWN_MS / sm) {
      this.obsTimer = 0;
      this.obstacles.push(makeObstacle(width));
    }

    const itemSpeed = WATER_BASE_SPEED * sm * boost * dtSec;

    // 발자국 이동 + 수집 (+10점, 파워모드 +20점)
    this.footprints = this.footprints.filter((fp) => {
      fp.y += itemSpeed;
      if (hitFootprint(player, fp)) {
        this.score += this.isPowerMode
          ? FOOTPRINT_SCORE * POWER_SCORE_MULT
          : FOOTPRINT_SCORE;
        this.emitUpdate();
        return false;
      }
      return fp.y < this.canvas.height + fp.radius * 2;
    });

    // 물병 이동 + 수집 (게이지 충전, 점수 없음)
    this.waterBottles = this.waterBottles.filter((item) => {
      item.y += itemSpeed;
      if (hitWaterBottle(player, item)) {
        this.gaugeCount++;
        if (this.gaugeCount >= GAUGE_CAPACITY) {
          this.gaugeCount = 0;
          this.isPowerMode = true;
          this.powerTimeLeft = POWER_DURATION;
        }
        this.emitUpdate();
        return false;
      }
      return item.y < this.canvas.height + item.radius * 2;
    });

    // 장애물 이동 + 충돌 (파워모드 중 무적)
    const obsSpeed = OBSTACLE_BASE_SPEED * sm * boost * dtSec;
    for (const obs of this.obstacles) obs.y += obsSpeed;

    if (
      !this.isPowerMode &&
      this.obstacles.some((obs) => hitObstacle(player, obs))
    ) {
      this.running = false;
      this.render();
      this.onGameOver();
      return;
    }
    this.obstacles = this.obstacles.filter(
      (obs) => obs.y < this.canvas.height + obs.height,
    );
  }

  private render() {
    const { ctx, canvas } = this;
    const { width, height } = canvas;
    const pathLeft = width * ROAD_L;
    const pathWidth = width * (ROAD_R - ROAD_L);
    const theme = getThemeByDistance(this.distanceMeters);
    const rc = { ctx, width, height, pathLeft, pathWidth, isPowerMode: this.isPowerMode, scrollY: this.scrollY, aliveTime: this.aliveTime };

    // ── 배경 + 장식 (테마별 렌더링) ──
    renderBackground(rc, theme);
    renderDecorations(rc, theme);

    // ── 발자국 아이템 (황금 원) ──
    for (const fp of this.footprints) {
      this.drawFootprint(fp.x, fp.y, fp.radius);
    }

    // ── 물병 아이템 ──
    for (const item of this.waterBottles) {
      this.drawWaterBottle(item.x, item.y, item.radius);
    }

    // ── 장애물 ──
    for (const obs of this.obstacles) {
      if (obs.variant === "rock")
        this.drawRock(obs.x, obs.y, obs.width, obs.height);
      else this.drawPuddle(obs.x, obs.y, obs.width, obs.height);
    }

    // ── 파워모드 불꽃 효과 (플레이어 뒤) ──
    if (this.isPowerMode) {
      this.drawFlameEffect();
    }

    // ── 플레이어 🚶 ──
    const { player: p } = this;
    const bob = this.running ? Math.sin(this.aliveTime * 10) * 2.5 : 0;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.font = `${p.height + 8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("🚶", p.x + p.width / 2, p.y + bob - 4);
    ctx.restore();

    // ── 파워모드 캔버스 비네트 (모든 요소 위에 덮기) ──
    if (this.isPowerMode) {
      const { width, height } = canvas;
      const t = this.aliveTime;
      const pulse = 0.22 + Math.sin(t * 5) * 0.07;
      const intensity = this.powerTimeLeft <= 3 ? pulse * 1.7 : pulse;
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.2,
        width / 2, height / 2, height * 0.9,
      );
      grad.addColorStop(0, 'rgba(255,160,0,0)');
      grad.addColorStop(1, `rgba(255,80,0,${intensity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  private drawFlameEffect() {
    const { ctx, player: p } = this;
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;
    const t = this.aliveTime;

    // 외곽 글로우
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(t * 6) * 0.08;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6F00";
    ctx.fill();
    ctx.restore();

    // 궤도를 도는 불꽃 파티클
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 4;
      const r = 28 + Math.sin(t * 8 + i * 1.2) * 4;
      const fx = cx + Math.cos(angle) * r;
      const fy = cy + Math.sin(angle) * r;
      const size = 7 + Math.sin(t * 10 + i) * 2;
      ctx.beginPath();
      ctx.arc(fx, fy, size, 0, Math.PI * 2);
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255, 220, 0, 0.9)" : "rgba(255, 110, 0, 0.85)";
      ctx.fill();
    }
  }


  private drawFootprint(cx: number, cy: number, r: number) {
    const { ctx } = this;
    // 황금 원
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.strokeStyle = "#FF8F00";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // 발 모양 힌트: 상단 작은 원 3개
    ctx.fillStyle = "#FF8F00";
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i - 1) * 0.55;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * r * 0.62,
        cy + Math.sin(a) * r * 0.62,
        r * 0.22,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // 중앙 발바닥 타원
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.1, r * 0.38, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawWaterBottle(cx: number, cy: number, r: number) {
    const { ctx } = this;
    const bw = r * 1.5,
      bh = r * 2.5;
    const bx = cx - bw / 2,
      by = cy - bh / 2;
    ctx.fillStyle = "#0D47A1";
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.18, by, bw * 0.64, bh * 0.22, 3);
    ctx.fill();
    ctx.fillStyle = "#90CAF9";
    ctx.beginPath();
    ctx.roundRect(bx, by + bh * 0.2, bw, bh * 0.8, 5);
    ctx.fill();
    ctx.fillStyle = "#42A5F5";
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + bh * 0.55, bw - 4, bh * 0.42, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.14, by + bh * 0.25, bw * 0.22, bh * 0.38, 2);
    ctx.fill();
  }

  private drawRock(x: number, y: number, w: number, h: number) {
    const { ctx } = this;
    const cx = x + w / 2,
      cy = y + h / 2;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(cx + 3, cy + 5, w / 2.1, h / 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#78909C";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#B0BEC5";
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 5, w / 4.5, h / 4.5, -0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPuddle(x: number, y: number, w: number, h: number) {
    const { ctx } = this;
    const cx = x + w / 2,
      cy = y + h / 2,
      rx = w / 2,
      ry = h / 2;
    ctx.fillStyle = "#5C9CB5";
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(
      cx - rx * 0.25,
      cy - ry * 0.2,
      rx * 0.28,
      ry * 0.32,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#3D7A96";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
