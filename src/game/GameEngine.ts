import type {
  Player,
  Footprint,
  WaterBottle,
  ClockItem,
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
  CLOCK_SPAWN_MS,
  SLOW_DURATION,
  SLOW_FACTOR,
  SLOW_EASE_DURATION,
  POWER_SPEED_BOOST,
  DISTANCE_SPEED,
  OBSTACLE_BASE_SPEED,
  OBSTACLE_SPAWN_MS,
  GAUGE_CAPACITY,
  POWER_DURATION,
  POWER_SCORE_MULT,
  SPEED_RAMP,
  SPEED_CAP,
  MOONLIGHT_SPEED,
  MILESTONES,
  MOONLIGHT_DURATION,
} from "./constants";
import {
  makeFootprint,
  makeWaterBottle,
  makeClockItem,
  makeObstacle,
} from "./spawn";
import {
  hitFootprint,
  hitWaterBottle,
  hitClockItem,
  hitObstacle,
} from "./collision";
import { type GameTheme, THEMES, getThemeByDistance } from "./themes";
import { renderBackground, renderDecorations } from "./themeRenderer";
import { audioManager } from "../utils/audio";

// ctx.roundRect 미지원 WebView 폴백
function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const cr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);
    ctx.arcTo(x + w, y, x + w, y + cr, cr);
    ctx.lineTo(x + w, y + h - cr);
    ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
    ctx.lineTo(x + cr, y + h);
    ctx.arcTo(x, y + h, x, y + h - cr, cr);
    ctx.lineTo(x, y + cr);
    ctx.arcTo(x, y, x + cr, y, cr);
    ctx.closePath();
  }
}
import footprintSrc from "../assets/images/item-footprint.png";
import waterBottleSrc from "../assets/images/item-water-bottle.png";

// 장애물 이미지 — 돌(공통) + 테마별 두 번째 장애물
import obsParRock from "../assets/images/obstacles/obs-park-rock.png";
import obsParPuddle from "../assets/images/obstacles/obs-park-puddle.png";
import obsForRock from "../assets/images/obstacles/obs-forest-rock.png"; // 숲·산: 그루터기
import obsForPuddle from "../assets/images/obstacles/obs-forest-puddle.png";
import obsAutRock from "../assets/images/obstacles/obs-autumn-rock.png";
import obsCheRock from "../assets/images/obstacles/obs-cherry-rock.png";
import obsSnoRock from "../assets/images/obstacles/obs-snow-rock.png";
import obsMtnRock from "../assets/images/obstacles/obs-mountain-rock.png";

// 파워워커 발동 시 테마별 말풍선 메시지
const POWER_MESSAGES: Record<string, string[]> = {
  park: [
    "날씨 좋다~ ☀️",
    "기분 최고!",
    "오늘 산책 완벽~",
    "상쾌하다!",
    "신난다~!",
  ],
  forest: [
    "공기가 맑다!",
    "피톤치드 뿜뿜 🌿",
    "자연이 최고야~",
    "힐링되네~",
    "숲이 좋아!",
  ],
  autumn: [
    "단풍이 예쁘다! 🍁",
    "가을 산책 최고~",
    "낙엽이 사각사각",
    "선선해서 좋아~",
    "가을이 왔어~",
  ],
  cherry: [
    "꽃이 피었다! 🌸",
    "봄이 왔어~",
    "벚꽃 구경 중~",
    "꽃바람이 살랑~",
    "너무 예쁘다!",
  ],
  snow: [
    "눈이 왔다! ❄️",
    "하얗다~!",
    "발자국이 찍혀~",
    "눈길 산책~",
    "겨울 최고!",
  ],
  bamboo: [
    "대나무숲이다! 🎋",
    "시원하다~!",
    "바람이 솔솔~",
    "대나무 향기~",
    "고요하고 좋아!",
  ],
  moonlight: [
    "황금 발자국이다! ✨",
    "별빛이 쏟아져~ 🌙",
    "황금 발자국 +20점! 🌟",
    "달빛 아래 최고야~",
    "이게 바로 보너스! 🎊",
    "황금빛이 반짝반짝~",
    "별이 쏟아진다! ✨",
    "달님이 응원해요 🌙",
  ],
};

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private player!: Player;
  private footprints: Footprint[] = [];
  private waterBottles: WaterBottle[] = [];
  private clockItems: ClockItem[] = [];
  private sweatParticles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
  }[] = [];
  private sweatTimer = 0;
  private obstacles: Obstacle[] = [];

  private score = 0;
  private gaugeCount = 0;
  private isPowerMode = false;
  private powerTimeLeft = 0;
  private isSlowMode = false;
  private slowTimeLeft = 0;
  private slowEaseTimer = 0; // 시계 종료 후 속도 페이드인 카운트다운
  private snowTrail: Array<{ x: number; yd: number }> = [];
  private snowTrailTimer = 0;

  private running = false;
  private paused = false;
  private rafId = 0;
  private prevTime = 0;
  private footprintTimer = 0;
  private waterTimer = 0;
  private clockTimer = 0;
  private obsTimer = 0;
  private aliveTime = 0;
  private scrollY = 0;

  private distanceMeters = 0;
  private nextDistanceScore = 10;
  private reachedMilestones = new Set<number>();
  private currentThemeId = THEMES[0].id;
  private moonlightTimeLeft = -1; // -1: 미시작
  isPracticeMode = false; // 체험 모드 — 충돌 무시, 저장 없음
  private moonlightMsgTimer = 0;
  private finishSequence = false;
  private finishTimer = 0;
  private photoMode = false;
  private onFinishReady: (() => void) | null = null;
  setFinishReadyCallback(cb: () => void) {
    this.onFinishReady = cb;
  }

  touchX: number | null = null;
  moveDx = 0;
  playerPos = { x: 0, y: 0, width: 0, height: 0 }; // render마다 갱신

  private characterImg: HTMLImageElement | null = null;
  private readonly footprintImg = GameEngine.loadImg(footprintSrc);
  private footprintColorized: HTMLCanvasElement | null = null;
  private footprintGolden: HTMLCanvasElement | null = null;
  private readonly waterBottleImg = GameEngine.loadImg(waterBottleSrc);

  // 돌: 숲·산은 그루터기, 나머지는 기본 돌
  private readonly obsRockByTheme: Record<string, HTMLImageElement> = {
    default: GameEngine.loadImg(obsParRock),
    forest: GameEngine.loadImg(obsForRock),
    bamboo: GameEngine.loadImg(obsForRock),
  };

  // 테마별 두 번째 장애물 (공원=웅덩이, 그 외=테마 캐릭터)
  private readonly obsPuddleImgs: Record<string, HTMLImageElement> = {
    park: GameEngine.loadImg(obsParPuddle),
    forest: GameEngine.loadImg(obsForPuddle), // 다람쥐
    autumn: GameEngine.loadImg(obsAutRock), // 단풍낙엽
    cherry: GameEngine.loadImg(obsCheRock), // 벚꽃낙엽
    snow: GameEngine.loadImg(obsSnoRock), // 눈사람
    bamboo: GameEngine.loadImg(obsMtnRock), // 등산객
    moonlight: GameEngine.loadImg(obsMtnRock), // 등산객 (재사용)
  };

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
  private onDodger: ((msg: string) => void) | null = null;
  private onPowerMsg: ((msg: string) => void) | null = null;

  setDodgerCallback(cb: (msg: string) => void) {
    this.onDodger = cb;
  }
  setPowerMsgCallback(cb: (msg: string) => void) {
    this.onPowerMsg = cb;
  }

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

  start(startDistance = 0) {
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
    this.clockItems = [];
    this.obstacles = [];
    this.score = 0;
    this.gaugeCount = 0;
    this.isPowerMode = false;
    this.powerTimeLeft = 0;
    this.isSlowMode = false;
    this.slowTimeLeft = 0;
    this.slowEaseTimer = 0;
    this.snowTrail = [];
    this.snowTrailTimer = 0;
    this.footprintTimer = 0;
    this.waterTimer = 0;
    this.clockTimer = 0;
    this.sweatParticles = [];
    this.sweatTimer = 0;
    this.obsTimer = OBSTACLE_SPAWN_MS * 0.55;
    this.aliveTime = 0;
    this.scrollY = 0;
    this.distanceMeters = startDistance;
    this.nextDistanceScore = Math.floor(startDistance / 10) * 10 + 10;
    this.reachedMilestones = new Set<number>();
    this.currentThemeId = getThemeByDistance(startDistance).id;
    this.moonlightTimeLeft = -1;
    this.finishSequence = false;
    this.finishTimer = 0;
    this.running = true;
    this.prevTime = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    this.paused = false;
    this.photoMode = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  pause(): boolean {
    if (!this.running || this.paused) return false;
    this.paused = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    return true;
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.prevTime = 0; // dt 스파이크 방지
    this.rafId = requestAnimationFrame(this.tick);
  }

  get isGamePaused() {
    return this.paused;
  }

  private emitUpdate() {
    this.onUpdate({
      score: this.score,
      gaugeCount: this.gaugeCount,
      distanceMeters: Math.floor(this.distanceMeters),
      isPowerMode: this.isPowerMode,
      powerTimeLeft: this.powerTimeLeft,
      isSlowMode: this.isSlowMode,
      slowTimeLeft: this.slowTimeLeft,
      moonlightTimeLeft: Math.max(0, Math.ceil(this.moonlightTimeLeft)),
    });
  }

  private tick = (now: number) => {
    if (!this.running && !this.photoMode) return;
    const dt = this.prevTime ? Math.min(now - this.prevTime, 50) : 16;
    this.prevTime = now;
    if (this.photoMode) {
      this.aliveTime += dt / 1000;
      // 캐릭터 수평 중앙으로 부드럽게 이동
      const centerX = this.canvas.width / 2 - this.player.width / 2;
      this.player.x += (centerX - this.player.x) * 0.08;
      this.render();
    } else {
      this.update(dt / 1000);
      this.render();
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  private get speedMult(): number {
    if (this.currentThemeId === "moonlight") return MOONLIGHT_SPEED;
    return Math.min(1 + this.aliveTime * SPEED_RAMP, SPEED_CAP);
  }

  private update(dtSec: number) {
    this.aliveTime += dtSec;
    const { width } = this.canvas;
    const sm = this.speedMult;
    // 파워모드 > 슬로우 우선순위 (동시에 발동 시 파워모드 적용)
    // 시계 종료 후 slowEaseTimer 동안 0.5→1.0으로 선형 페이드인
    const slowEaseFactor =
      this.slowEaseTimer > 0
        ? SLOW_FACTOR + (1 - SLOW_FACTOR) * (1 - this.slowEaseTimer / SLOW_EASE_DURATION)
        : 1;
    const boost = this.isPowerMode
      ? POWER_SPEED_BOOST
      : this.isSlowMode
        ? SLOW_FACTOR
        : slowEaseFactor;
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

    // 슬로우 카운트다운
    if (this.isSlowMode) {
      const prevCeil = Math.ceil(this.slowTimeLeft);
      this.slowTimeLeft -= dtSec;
      if (this.slowTimeLeft <= 0) {
        this.isSlowMode = false;
        this.slowTimeLeft = 0;
        this.slowEaseTimer = SLOW_EASE_DURATION; // 속도 페이드인 시작
        this.emitUpdate();
      } else if (Math.ceil(this.slowTimeLeft) !== prevCeil) {
        this.emitUpdate();
      }
    }

    // 시계 종료 후 속도 페이드인
    if (this.slowEaseTimer > 0) {
      this.slowEaseTimer = Math.max(0, this.slowEaseTimer - dtSec);
    }

    // 배경 스크롤
    const scrollDelta = WATER_BASE_SPEED * sm * boost * dtSec;
    this.scrollY = (this.scrollY + scrollDelta) % 60;

    // 눈길 자국 트레일 포인트 수집
    if (this.currentThemeId === 'snow' && this.player) {
      this.snowTrailTimer += dtSec;
      if (this.snowTrailTimer >= 0.04) {
        this.snowTrailTimer = 0;
        this.snowTrail.push({ x: this.player.x + this.player.width / 2, yd: 0 });
      }
      for (const p of this.snowTrail) p.yd += scrollDelta;
      this.snowTrail = this.snowTrail.filter(p => p.yd < this.canvas.height + 20);
    }

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
      if (newTheme.id === "moonlight") this.obstacles = [];
      this.onThemeChange(newTheme);
    }

    // 달빛길 보너스 타이머
    if (this.currentThemeId === "moonlight") {
      if (this.finishSequence) {
        this.aliveTime += dtSec; // 별 반짝임 유지
        this.finishTimer += dtSec;
        if (this.finishTimer >= 2.5 && !this.photoMode) {
          this.photoMode = true;
          this.onFinishReady?.();
        }
        return;
      }
      if (this.moonlightTimeLeft < 0) {
        this.moonlightTimeLeft = MOONLIGHT_DURATION;
        this.moonlightMsgTimer = 8; // 첫 메시지 8초 후
      }
      this.moonlightTimeLeft -= dtSec;
      this.emitUpdate();

      // 달빛길 전용 말풍선 — 8~12초 간격으로 랜덤 출력
      this.moonlightMsgTimer -= dtSec;
      if (this.moonlightMsgTimer <= 0) {
        const msgs = POWER_MESSAGES["moonlight"];
        this.onDodger?.(msgs[Math.floor(Math.random() * msgs.length)]);
        this.moonlightMsgTimer = 8 + Math.random() * 4; // 8~12초 간격
      }

      if (this.moonlightTimeLeft <= 0) {
        this.finishSequence = true;
        this.finishTimer = 0;
        this.footprints = [];
        return;
      }
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

    // 시계 아이템 스폰 — 단풍길(350m)부터, 슬로우·달빛길 중엔 스폰 안 함
    if (
      !this.isSlowMode &&
      this.distanceMeters >= 350 &&
      this.currentThemeId !== "moonlight"
    ) {
      this.clockTimer += dtSec * 1000;
      if (this.clockTimer >= CLOCK_SPAWN_MS / sm) {
        this.clockTimer = 0;
        this.clockItems.push(makeClockItem(width));
      }
    }

    // 장애물 스폰 (달빛길은 장애물 없음)
    this.obsTimer += dtSec * 1000;
    if (
      this.obsTimer >= OBSTACLE_SPAWN_MS / sm &&
      getThemeByDistance(this.distanceMeters).id !== "moonlight"
    ) {
      this.obsTimer = 0;
      const obs = makeObstacle(width);
      const tid = getThemeByDistance(this.distanceMeters).id;
      // 다람쥐(숲길) → 50% dodger, 50% 정적 웅덩이
      if (obs.variant === "puddle" && tid === "forest" && Math.random() < 0.5) {
        obs.style = "dodger";
        obs.dodgerType = "squirrel";
        obs.driftVx = 0;
        obs.noticed = false;
      }
      // 등산객(대나무) → puddle 100% dodger (웅덩이 없음)
      if (obs.variant === "puddle" && tid === "bamboo") {
        obs.style = "dodger";
        obs.dodgerType = "hiker";
        obs.driftVx = 0;
        obs.noticed = false;
      }
      this.obstacles.push(obs);
    }

    const itemSpeed = WATER_BASE_SPEED * sm * boost * dtSec;

    // 발자국 이동 + 수집 (+10점, 파워모드 +20점)
    this.footprints = this.footprints.filter((fp) => {
      fp.y += itemSpeed;
      if (hitFootprint(player, fp)) {
        const isMoonlight =
          getThemeByDistance(this.distanceMeters).id === "moonlight";
        this.score +=
          this.isPowerMode || isMoonlight
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
          const tid = getThemeByDistance(this.distanceMeters).id;
          const msgs = POWER_MESSAGES[tid] ?? POWER_MESSAGES["park"];
          this.onPowerMsg?.(msgs[Math.floor(Math.random() * msgs.length)]);
        }
        this.emitUpdate();
        return false;
      }
      return item.y < this.canvas.height + item.radius * 2;
    });

    // 시계 아이템 이동 + 수집 → 슬로우 발동
    this.clockItems = this.clockItems.filter((item) => {
      item.y += itemSpeed;
      if (hitClockItem(player, item)) {
        this.isSlowMode = true;
        this.slowTimeLeft = SLOW_DURATION;
        this.emitUpdate();
        return false;
      }
      return item.y < this.canvas.height + item.radius * 2;
    });

    // 장애물 이동 + 충돌 (파워모드 중 무적)
    const obsSpeed = OBSTACLE_BASE_SPEED * sm * boost * dtSec;

    for (const obs of this.obstacles) {
      obs.y += obsSpeed;

      if (obs.style === "dodger") {
        // 아직 발견 전: 플레이어와 거리 체크
        if (!obs.noticed) {
          const dy = player.y - obs.y;
          if (dy > 0 && dy < 190) {
            // 발견! 도망 시작
            obs.noticed = true;
            obs.noticedAt = this.aliveTime;
            // 플레이어 반대 방향으로 도망
            const obsCx = obs.x + obs.width / 2;
            const dir = obsCx < player.x ? -1 : 1;
            obs.driftVx = dir * (60 + Math.random() * 25);
            if (obs.dodgerType === "squirrel")
              this.onDodger?.("앗! 다람쥐다! 🐿️");
            if (obs.dodgerType === "hiker") this.onDodger?.("안녕하세요! 🙋");
          }
        }
        // 도망 중: 가속하면서 옆으로
        if (obs.noticed && obs.driftVx) {
          obs.x += obs.driftVx * sm * dtSec;
        }
      }
    }

    if (
      !this.isPowerMode &&
      !this.isPracticeMode &&
      this.obstacles.some((obs) => hitObstacle(player, obs))
    ) {
      this.running = false;
      this.render();
      this.onGameOver();
      return;
    }
    this.obstacles = this.obstacles.filter(
      (obs) =>
        obs.y < this.canvas.height + obs.height &&
        obs.x > -obs.width - 80 &&
        obs.x < this.canvas.width + 80,
    );

    // 땀방울 파티클 (150m 이후, 빨라질수록 자주 생성)
    if (this.distanceMeters >= 150 && this.player) {
      this.sweatTimer += dtSec;
      const interval = Math.max(0.35, 1.2 / this.speedMult);
      if (this.sweatTimer >= interval) {
        this.sweatTimer = 0;
        const r = ((this.player.height + 8) / 2) * 1.13;
        const cx = this.player.x + this.player.width / 2;
        const cy = this.player.y - 4 + r;
        this.sweatParticles.push({
          x: cx + r * 0.65 + (Math.random() - 0.3) * 6,
          y: cy - r * 0.45 + (Math.random() - 0.5) * 6,
          vx: 28 + Math.random() * 28,
          vy: -(52 + Math.random() * 36),
          life: 1,
          size: 3.5 + Math.random() * 2.5,
        });
      }
      this.sweatParticles = this.sweatParticles.filter((p) => {
        p.x += p.vx * dtSec;
        p.y += p.vy * dtSec;
        p.vy += 55 * dtSec; // 살짝 중력
        p.life -= 0.85 * dtSec;
        return p.life > 0;
      });
    }
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
      playerCx: this.player ? this.player.x + this.player.width / 2 : undefined,
      playerY: this.player ? this.player.y + this.player.height : undefined,
      snowTrail: this.currentThemeId === 'snow' ? this.snowTrail : undefined,
    };

    // ── 배경 + 장식 (테마별 렌더링) ──
    renderBackground(rc, theme);
    renderDecorations(rc, theme);

    if (!this.photoMode) {
      // ── 발자국 아이템 (황금 원) ──
      for (const fp of this.footprints) {
        this.drawFootprint(fp.x, fp.y, fp.radius);
      }

      // ── 물병 아이템 ──
      for (const item of this.waterBottles) {
        this.drawWaterBottle(item.x, item.y, item.radius);
      }

      // ── 시계 아이템 ──
      for (const item of this.clockItems) {
        this.drawClockItem(item.x, item.y, item.radius);
      }
    }

    // ── 장애물 ──
    for (const obs of this.obstacles) {
      if (obs.variant === "rock") {
        this.drawRock(obs.x, obs.y, obs.width, obs.height, obs.id);
      } else if (obs.style === "dodger") {
        this.drawDodgingObstacle(obs);
      } else {
        this.drawPuddle(obs.x, obs.y, obs.width, obs.height);
      }
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

    // ── 파워모드 캔버스 비네트 ──
    if (this.isPowerMode) {
      const { width, height } = canvas;
      const t = this.aliveTime;
      const pulse = 0.18 + Math.sin(t * 5) * 0.06;

      if (this.currentThemeId === "moonlight") {
        // 달빛길: 황금+보랏빛 달빛 비네트
        const moonPulse = 0.22 + Math.sin(t * 3) * 0.1;
        const grad = ctx.createRadialGradient(
          width / 2,
          height * 0.3,
          height * 0.1,
          width / 2,
          height / 2,
          height * 0.95,
        );
        grad.addColorStop(0, `rgba(255,230,100,0)`);
        grad.addColorStop(0.5, `rgba(180,120,255,${moonPulse * 0.4})`);
        grad.addColorStop(1, `rgba(80,40,160,${moonPulse})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 황금 별빛 파티클 (상단에서 쏟아짐)
        ctx.save();
        for (let i = 0; i < 6; i++) {
          const sx =
            width * (0.1 + 0.16 * i) + Math.sin(t * 1.5 + i * 1.2) * 12;
          const sy = (t * 40 * (0.6 + i * 0.08)) % height;
          const alpha = 0.6 + Math.sin(t * 3 + i) * 0.3;
          const r = 1.5 + (i % 3) * 0.8;
          ctx.fillStyle = `rgba(255,220,80,${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        // 기존: 민트/수분 비네트
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

    // ── 땀방울 파티클 ──
    for (const p of this.sweatParticles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life) * 0.9;
      ctx.translate(p.x, p.y);
      ctx.rotate(-Math.PI / 5); // 오른쪽 위 방향으로 기울기
      // 물방울 몸통
      ctx.fillStyle = "#64B5F6";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      // 하이라이트
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(
        -p.size * 0.12,
        -p.size * 0.22,
        p.size * 0.18,
        p.size * 0.28,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    // 플레이어 위치 노출 (SpeechBubble 추적용)
    if (this.player) {
      this.playerPos = {
        x: this.player.x,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height,
      };
    }

    // 달빛길 피니시 텍스트
    if (this.finishSequence || this.photoMode) {
      this.drawFinishBanner();
    }
  }

  private drawFinishBanner() {
    const { ctx, canvas } = this;
    const cx = canvas.width / 2;
    const t = this.finishTimer;
    const appear = Math.min(t / 0.4, 1);
    const pulse = 1 + Math.sin(t * 5) * 0.04;
    const cy = canvas.height * 0.32;
    const fp = this.getGoldenFootprint();

    // 황금 발자국 — 텍스트 뒤 배경 (반투명)
    const bgSize = 220;
    ctx.save();
    ctx.globalAlpha = appear * 0.22;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.drawImage(fp, cx - bgSize / 2, cy - bgSize / 2, bgSize, bgSize);
    ctx.restore();

    // 텍스트 (발자국 위에)
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 30 + Math.sin(t * 4) * 10;
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("FINISHED!", 0, 0);
    ctx.shadowBlur = 15;
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "rgba(255,255,200,0.9)";
    ctx.fillText("🏆 모든 테마 완주 ✨", 0, 44);
    ctx.restore();

  }

  private drawFlameEffect() {
    const { ctx, player: p } = this;
    const t = this.aliveTime;
    const charR = ((p.height + 8) / 2) * 1.13;
    const cx = p.x + p.width / 2;
    const cy = p.y - 4 + charR + (this.running ? Math.sin(t * 10) * 2.5 : 0);
    const orbitR = charR + 16;

    if (this.currentThemeId === "moonlight") {
      // ── 달빛 황금 오브 ──
      // 황금 글로우 링
      ctx.save();
      ctx.globalAlpha = 0.2 + Math.sin(t * 3) * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR + 8, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD700";
      ctx.fill();
      ctx.restore();

      // 보랏빛 궤도 링
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(t * 2.5) * 0.1;
      ctx.strokeStyle = "rgba(220,180,255,0.85)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -t * 25;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 황금 별 오브 8개
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 2.2;
        const ox = cx + Math.cos(angle) * orbitR;
        const oy = cy + Math.sin(angle) * orbitR;
        const size = 5 + Math.sin(t * 4 + i * 1.2) * 1.8;
        const isGold = i % 2 === 0;

        ctx.save();
        ctx.shadowColor = isGold
          ? "rgba(255,215,0,0.9)"
          : "rgba(200,160,255,0.8)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = isGold
          ? "rgba(255,220,60,0.95)"
          : "rgba(210,170,255,0.9)";
        ctx.beginPath();
        ctx.arc(ox, oy, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 반짝임 하이라이트
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.beginPath();
        ctx.arc(ox - size * 0.3, oy - size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    // ── 기존 민트/수분 오브 ──
    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(t * 4) * 0.06;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#00BCD4";
    ctx.fill();
    ctx.restore();

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

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 2.8;
      const ox = cx + Math.cos(angle) * orbitR;
      const oy = cy + Math.sin(angle) * orbitR;
      const size = 6 + Math.sin(t * 5 + i * 1.4) * 1.5;
      const isBlue = i % 2 === 0;

      ctx.save();
      ctx.shadowColor = isBlue ? "rgba(33,150,243,0.7)" : "rgba(0,188,212,0.7)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = isBlue ? "rgba(66,165,245,0.92)" : "rgba(0,188,212,0.88)";
      ctx.beginPath();
      ctx.arc(ox, oy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.arc(ox - size * 0.28, oy - size * 0.28, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawClockItem(cx: number, cy: number, r: number) {
    const { ctx } = this;
    ctx.save();
    // 흰 배경 원 (눈에 잘 띄도록)
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
    // 이모지
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.font = `${r * 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⏱️", cx, cy);
    ctx.restore();
  }

  // 발자국 이미지를 카키색으로 1회 변환 후 캐시 (모든 기기 호환)
  private getColorizedFootprint(): HTMLCanvasElement | HTMLImageElement {
    if (this.footprintColorized) return this.footprintColorized;
    if (!this.footprintImg.complete || !this.footprintImg.naturalWidth)
      return this.footprintImg;

    const size = 128;
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const oc = offscreen.getContext("2d")!;
    oc.drawImage(this.footprintImg, 0, 0, size, size);

    const data = oc.getImageData(0, 0, size, size);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 20) {
        // 투명하지 않은 픽셀만 카키색으로
        d[i] = 80; // R
        d[i + 1] = 68; // G
        d[i + 2] = 38; // B  → 진카키 #50441E
      }
    }
    oc.putImageData(data, 0, 0);
    this.footprintColorized = offscreen;
    return this.footprintColorized;
  }

  private getGoldenFootprint(): HTMLCanvasElement | HTMLImageElement {
    if (this.footprintGolden) return this.footprintGolden;
    if (!this.footprintImg.complete || !this.footprintImg.naturalWidth)
      return this.footprintImg;
    const size = 128;
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const oc = offscreen.getContext("2d")!;
    oc.drawImage(this.footprintImg, 0, 0, size, size);
    const data = oc.getImageData(0, 0, size, size);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 20) {
        d[i] = 212;
        d[i + 1] = 175;
        d[i + 2] = 55;
      } // 황금색 #D4AF37
    }
    oc.putImageData(data, 0, 0);
    this.footprintGolden = offscreen;
    return this.footprintGolden;
  }

  private drawFootprint(cx: number, cy: number, r: number) {
    const { ctx } = this;
    const tid = getThemeByDistance(this.distanceMeters).id;
    const isMoonlight = tid === "moonlight";
    const isDark = tid === "forest" || isMoonlight;

    if (isMoonlight) {
      ctx.save();
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 22 + Math.sin(this.aliveTime * 4) * 8;
      ctx.drawImage(this.getGoldenFootprint(), cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      return;
    }

    // 어두운 길(숲·산): 흰 후광으로 가시성 확보
    if (isDark) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 카키색 발자국 이미지 (배경 없이)
    ctx.drawImage(this.getColorizedFootprint(), cx - r, cy - r, r * 2, r * 2);
  }

  private drawWaterBottle(cx: number, cy: number, r: number) {
    const { ctx } = this;
    const bw = r * 1.5,
      bh = r * 2.5;
    const tilt = 0.22; // 약 12° 기울기
    const bob = Math.sin(this.aliveTime * 2.5 + cx * 0.04) * 4; // 동동 float

    // 바닥 그림자 (회전 없음)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.ellipse(
      cx + 2,
      cy + bh / 2 + bob + 3,
      bw * 0.32,
      bh * 0.04,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();

    // 물병 (기울기 + floating)
    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.rotate(tilt);
    ctx.shadowColor = "rgba(0,60,160,0.18)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(this.waterBottleImg, -bw / 2, -bh / 2, bw, bh);
    // 유리 반짝임
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    rrect(
      ctx,
      -bw / 2 + bw * 0.28,
      -bh / 2 + bh * 0.28,
      bw * 0.13,
      bh * 0.32,
      3,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.beginPath();
    rrect(
      ctx,
      -bw / 2 + bw * 0.45,
      -bh / 2 + bh * 0.34,
      bw * 0.07,
      bh * 0.16,
      2,
    );
    ctx.fill();
    ctx.restore();
  }

  private drawDodgingObstacle(obs: Obstacle) {
    const { ctx } = this;
    // 스폰 당시 테마 이미지를 dodgerType으로 고정 (테마 전환 시 이미지 바뀌는 버그 방지)
    const imgKey =
      obs.dodgerType === "squirrel"
        ? "forest"
        : obs.dodgerType === "hiker"
          ? "bamboo"
          : "park";
    const img = this.obsPuddleImgs[imgKey] ?? this.obsPuddleImgs["park"];
    const { x, y, width: w, height: h, noticed, noticedAt, driftVx } = obs;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const t = this.aliveTime;

    // 발견 전: 천천히 둥실 / 발견 후: 통통 튀면서 도망
    const elapsed = noticed && noticedAt !== undefined ? t - noticedAt : -1;
    const bob = noticed
      ? -Math.abs(Math.sin(elapsed * 14)) * 10 // 통통 바운스 (위로 튐)
      : Math.sin(t * 2.5 + obs.id * 1.8) * 3; // 잔잔한 float
    const tilt = noticed && driftVx ? (driftVx > 0 ? 0.22 : -0.22) : 0;

    // 이미지 + 이미지 형태 따라가는 테두리 (shadow trick)
    ctx.save();
    ctx.shadowColor = "rgba(40,40,40,0.65)";
    ctx.shadowBlur = 4;
    ctx.translate(cx, cy + bob);
    ctx.rotate(tilt);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    // 발견 직후 반응 텍스트 — 0.8초 동안 떠오르며 사라짐
    if (noticed && elapsed >= 0 && elapsed < 0.8) {
      const alpha = 1 - elapsed / 0.8;
      const rise = elapsed * 22;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";

      if (obs.dodgerType === "hiker") {
        // 등산객: "먼저 가세요~!" 말풍선 스타일
        const text = "먼저 가세요~!";
        ctx.font = "bold 13px sans-serif";
        const tw = ctx.measureText(text).width;
        const bx = cx - tw / 2 - 8;
        const by = y - 44 - rise;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        rrect(ctx, bx, by, tw + 16, 24, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#2D7D52";
        ctx.fillText(text, cx, by + 16);
      } else {
        // 다람쥐: "!" 표시
        ctx.font = "bold 32px sans-serif";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#7B3F00";
        ctx.strokeText("!", cx, y - 12 - rise);
        ctx.fillStyle = "#FFD600";
        ctx.fillText("!", cx, y - 12 - rise);
      }
      ctx.restore();
    }
  }

  private drawRock(x: number, y: number, w: number, h: number, obsId = 0) {
    const tid = getThemeByDistance(this.distanceMeters).id;
    const { ctx } = this;
    // 대나무: 홀수=죽순🎍 / 짝수=돌맹이 이미지 번갈아
    if (tid === "bamboo" && obsId % 2 === 1) {
      ctx.save();
      ctx.font = `${h * 1.1}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(40,40,40,0.4)";
      ctx.shadowBlur = 6;
      ctx.fillText("🎍", x + w / 2, y + h / 2);
      ctx.restore();
      return;
    }
    const img = this.obsRockByTheme[tid] ?? this.obsRockByTheme["default"];
    ctx.save();
    ctx.filter = "saturate(160%) contrast(115%) brightness(105%)";
    ctx.shadowColor = "rgba(40,40,40,0.7)";
    ctx.shadowBlur = 4;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  private drawPuddle(x: number, y: number, w: number, h: number) {
    const tid = getThemeByDistance(this.distanceMeters).id;
    // 숲·산 테마의 obsPuddleImgs는 캐릭터(다람쥐·등산객) 이미지라 정적 웅덩이엔 공원 웅덩이 사용
    const staticTid = tid === "forest" || tid === "bamboo" ? "park" : tid;
    const img = this.obsPuddleImgs[staticTid] ?? this.obsPuddleImgs["park"];
    const { ctx } = this;
    ctx.save();
    ctx.filter = "saturate(160%) contrast(115%) brightness(105%)";
    ctx.shadowColor = "rgba(40,40,40,0.7)";
    ctx.shadowBlur = 4;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }
}
