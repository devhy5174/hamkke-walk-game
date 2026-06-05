import type {
  Player,
  Footprint,
  WaterBottle,
  Obstacle,
  GameStats,
  Milestone,
} from "./types";
import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_Y_RATIO,
  ROAD_L,
  ROAD_R,
  FOOTPRINT_SPAWN_MS,
  FOOTPRINT_SCORE,
  WATER_BASE_SPEED,
  WATER_SPAWN_MS,
  POWER_SPEED_BOOST,
  DISTANCE_SPEED,
  OBSTACLE_BASE_SPEED,
  OBSTACLE_SPAWN_MS,
  GAUGE_CAPACITY,
  POWER_DURATION,
  POWER_SCORE_MULT,
  SPEED_RAMP,
  MILESTONES,
} from "./constants";
import { makeFootprint, makeWaterBottle, makeObstacle } from "./spawn";
import { hitFootprint, hitWaterBottle, hitObstacle } from "./collision";
import { type GameTheme, THEMES, getThemeByDistance } from "./themes";
import { renderBackground, renderDecorations } from "./themeRenderer";
import { audioManager } from "../utils/audio";
import footprintSrc from "../assets/images/item-footprint.png";
import waterBottleSrc from "../assets/images/item-water-bottle.png";
import rockSrc from "../assets/images/obstacle-rock.png";
import puddleSrc from "../assets/images/obstacle-puddle.png";

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

  private characterImg: HTMLImageElement | null = null;
  private readonly footprintImg = GameEngine.loadImg(footprintSrc);
  private readonly waterBottleImg = GameEngine.loadImg(waterBottleSrc);
  private readonly rockImg = GameEngine.loadImg(rockSrc);
  private readonly puddleImg = GameEngine.loadImg(puddleSrc);

  private static loadImg(src: string): HTMLImageElement {
    const img = new Image();
    img.src = src;
    return img;
  }

  setCharacter(src: string): void {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.characterImg = img;
    };
  }

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
    this.ctx = canvas.getContext("2d")!;
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
    this.distanceMeters += sm * boost * DISTANCE_SPEED * dtSec;
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
        audioManager.playWater();
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
    const rc = {
      ctx,
      width,
      height,
      pathLeft,
      pathWidth,
      isPowerMode: this.isPowerMode,
      scrollY: this.scrollY,
      aliveTime: this.aliveTime,
    };

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

    // ── 플레이어 (원형 캐릭터 이미지) ──
    const { player: p } = this;
    const bob = this.running ? Math.sin(this.aliveTime * 10) * 2.5 : 0;
    const r = ((p.height + 8) / 2) * 1.13; // 13% 크기 증가
    const cx = p.x + p.width / 2;
    const cy = p.y + bob - 4 + r;

    if (this.characterImg?.complete && this.characterImg.naturalWidth > 0) {
      // 바닥 그림자 타원
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.92, r * 0.78, r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // 흰 외곽 링 (두껍게)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.restore();
      // 원형 클리핑 후 이미지
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.characterImg, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.font = `${p.height + 8}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("🚶", cx, p.y + bob - 4);
      ctx.restore();
    }

    // ── 파워모드 캔버스 비네트 (민트/수분 느낌) ──
    if (this.isPowerMode) {
      const { width, height } = canvas;
      const t = this.aliveTime;
      const pulse = 0.18 + Math.sin(t * 5) * 0.06;
      const intensity = this.powerTimeLeft <= 3 ? pulse * 1.8 : pulse;
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.25,
        width / 2,
        height / 2,
        height * 0.9,
      );
      grad.addColorStop(0, "rgba(0,180,200,0)");
      grad.addColorStop(1, `rgba(0,140,180,${intensity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  private drawFlameEffect() {
    const { ctx, player: p } = this;
    const t = this.aliveTime;
    // 캐릭터와 동일한 중심/반지름 계산
    const charR = ((p.height + 8) / 2) * 1.13;
    const cx = p.x + p.width / 2;
    const cy = p.y - 4 + charR + (this.running ? Math.sin(t * 10) * 2.5 : 0);
    const orbitR = charR + 16; // 캐릭터 외곽 바로 밖

    // 민트 글로우 링
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(t * 4) * 0.06;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#00BCD4";
    ctx.fill();
    ctx.restore();

    // 궤도 링 (점선 느낌)
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(t * 3) * 0.08;
    ctx.strokeStyle = "rgba(100,220,240,0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -t * 30;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 물방울 오브 6개
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 2.8;
      const ox = cx + Math.cos(angle) * orbitR;
      const oy = cy + Math.sin(angle) * orbitR;
      const size = 6 + Math.sin(t * 5 + i * 1.4) * 1.5;
      const isBlue = i % 2 === 0;

      // 물방울 본체
      ctx.save();
      ctx.shadowColor = isBlue ? "rgba(33,150,243,0.7)" : "rgba(0,188,212,0.7)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = isBlue ? "rgba(66,165,245,0.92)" : "rgba(0,188,212,0.88)";
      ctx.beginPath();
      ctx.arc(ox, oy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 물방울 하이라이트
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.arc(ox - size * 0.28, oy - size * 0.28, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawFootprint(cx: number, cy: number, r: number) {
    const { ctx } = this;
    // 어두운 테마(숲길 등)에서도 구분되도록 연한 글로우
    ctx.save();
    ctx.fillStyle = 'rgba(255,235,200,0.22)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // 갈색 발자국 (brightness 높여서 어두운 배경에서도 보임)
    ctx.save();
    ctx.filter = 'sepia(1) saturate(2) brightness(0.58)';
    ctx.drawImage(this.footprintImg, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  private drawWaterBottle(cx: number, cy: number, r: number) {
    const { ctx } = this;
    const bw = r * 1.5,
      bh = r * 2.5;
    const bx = cx - bw / 2,
      by = cy - bh / 2;
    // 바닥 그림자
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.ellipse(cx + 1, by + bh + 2, bw * 0.38, bh * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // 이미지
    ctx.save();
    ctx.shadowColor = "rgba(0,60,160,0.18)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(this.waterBottleImg, bx, by, bw, bh);
    ctx.restore();
    // 유리 반짝임 강화
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.3, by + bh * 0.3, bw * 0.13, bh * 0.32, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.31, by + bh * 0.34, bw * 0.07, bh * 0.16, 2);
    ctx.fill();
    ctx.restore();
  }

  private drawRock(x: number, y: number, w: number, h: number) {
    const { ctx } = this;
    const cx = x + w / 2,
      cy = y + h / 2;
    ctx.drawImage(this.rockImg, x, y, w, h);
    // 상단 하이라이트
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.ellipse(
      cx - w * 0.18,
      cy - h * 0.2,
      w * 0.18,
      h * 0.14,
      -0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  private drawPuddle(x: number, y: number, w: number, h: number) {
    const { ctx } = this;
    const cx = x + w / 2,
      cy = y + h / 2;
    const rx = w / 2,
      ry = h / 2;
    // 이미지 (채도 증가) — 웅덩이는 바닥 자체라 그림자/외곽선 없음
    ctx.save();
    ctx.filter = "saturate(1.9) brightness(1.08)";
    ctx.drawImage(this.puddleImg, x, y, w, h);
    ctx.restore();
    // 물 반짝임
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.beginPath();
    ctx.ellipse(
      cx - rx * 0.22,
      cy - ry * 0.18,
      rx * 0.24,
      ry * 0.32,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.ellipse(
      cx + rx * 0.18,
      cy + ry * 0.08,
      rx * 0.1,
      ry * 0.18,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }
}
