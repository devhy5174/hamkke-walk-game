// ── 완주 인트로 ───────────────────────────────────────────────────────────────
// 2000m 달빛길 진입 시 재생되는 컷신.
// 일반 게임 인트로(시작 화면)와 무관하며 완주 보상 연출 전용입니다.
// ─────────────────────────────────────────────────────────────────────────────
import { PLAYER_WIDTH, PLAYER_HEIGHT } from "./constants";

const PLAYER_R = ((PLAYER_HEIGHT + 8) / 2) * 1.13;

type Phase =
  | "idle"
  | "showfp" // 캐릭터 앞 황금 발자국 하나씩 등장 (타이머)
  | "speech1wait" // "어? 황금 발자국?!" — 탭 대기
  | "eatfp" // 배경 스크롤, 발자국 자동 수집
  | "walkoff" // 발자국 다 먹은 후 캐릭터가 화면 위로 퇴장
  | "fadeout" // 검은 페이드 (타이머)
  | "darkfp" // 검은 화면 — 발자국+문 자동 등장 (타이머)
  | "eatdarkfp" // 검은 화면 — 유저가 상하좌우 이동으로 발자국 수집 후 문 도달
  | "flashwhite" // 화면 하얘짐 (타이머) → 완료 즉시 done
  | "done";

export interface CompletionIntroCallbacks {
  onSpeech: (msg: string | null) => void;
  onVisualSwitch: () => void; // currentThemeId만 moonlight로 (BGM 없음)
  onThemeSwitch: () => void; // 테마 변경 + BGM 시작
}

export interface CompletionIntroUpdateResult {
  scrollDelta: number;
  newPlayerY: number | null;
  newPlayerX: number | null;
  playerYDelta: number; // eatfp 구간 캐릭터 자동 상향 이동량
}

interface Fp {
  x: number;
  y: number;
  alpha: number;
  eaten: boolean;
  flash: number;
  spawnAt: number;
}

// ── 상수 ─────────────────────────────────────────────────────────────────────
const WALK_SCROLL_SPEED = 150; // eatfp 배경 스크롤 속도 (px/s)
const EAT_RADIUS = 32; // 발자국 수집 판정 반경 (px)
const FP_RADIUS = 18;
const FP_COUNT = 5;

// showfp / darkfp 공통: 캐릭터 앞(위) 열 배치
const SHOW_FP_X_OFFSETS = [-14, 18, -14, 18, -14];
const SHOW_FP_Y_OFFSET = 85;
const SHOW_FP_Y_GAP = 72;
const SHOW_FP_SPAWN_DELAYS = [0.25, 0.55, 0.85, 1.15, 1.45];
const SHOWFP_AUTO_ADVANCE = 2.2;

// darkfp 전용
const DARK_FP_SPAWN_DELAYS = [0.2, 0.65, 1.1, 1.55, 2.0];
const DOOR_Y_RATIO = 0.08;
const DOOR_SPAWN_AT = 2.5;

const DUR_FADEOUT = 1.0;
const DUR_DARKFP = 3.5;
const DUR_FLASHWHITE = 0.8;
// CHAR_ENTER_DUR: darkfp 진입 시 거리/WALK_SCROLL_SPEED 로 동적 계산 (인스턴스 변수)

// ─────────────────────────────────────────────────────────────────────────────

/** 완주 인트로 — 달빛길 2000m 진입 시 재생되는 컷신 클래스 */
export class CompletionIntro {
  private phase: Phase = "idle";
  private timer = 0;
  private fadeAlpha = 0;
  private whiteAlpha = 0;
  private fps: Fp[] = [];
  private doorAlpha = 0;
  private doorScrollY = 0;
  private callbacks: CompletionIntroCallbacks | null = null;
  private canvasW = 0;
  private canvasH = 0;
  private playerStartY = 0;
  private eatdarkSpeechActive = false;
  private doorHintCooldown = 0;
  private charEnterDur = 1.0; // darkfp 캐릭터 등장 시간: fadeout→darkfp 진입 시 거리 기반 계산

  get isActive() {
    return this.phase !== "idle" && this.phase !== "done";
  }

  /** eatdarkfp 구간에서만 플레이어 상하좌우 이동 허용 */
  get isPlayerControlEnabled() {
    return this.phase === "eatdarkfp";
  }

  /** walkoff 구간: 캐릭터가 화면 밖으로 나가야 하므로 Y 클램프 해제 */
  get isWalkoffPhase() {
    return this.phase === "walkoff";
  }

  /** fadeout/flashwhite 구간: 플레이어 렌더 건너뜀 */
  get isPlayerHidden() {
    return this.phase === "fadeout" || this.phase === "flashwhite";
  }

  start(
    playerCx: number,
    playerY: number,
    canvasW: number,
    canvasH: number,
    cb: CompletionIntroCallbacks,
  ) {
    this.phase = "showfp";
    this.timer = 0;
    this.fadeAlpha = 0;
    this.whiteAlpha = 0;
    this.doorAlpha = 0;
    this.doorScrollY = 0;
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.playerStartY = playerY;
    this.callbacks = cb;

    this.fps = Array.from({ length: FP_COUNT }, (_, i) => ({
      x: playerCx + SHOW_FP_X_OFFSETS[i],
      y: playerY - SHOW_FP_Y_OFFSET - i * SHOW_FP_Y_GAP,
      alpha: 0,
      eaten: false,
      flash: 0,
      spawnAt: SHOW_FP_SPAWN_DELAYS[i],
    }));
  }

  /** 말풍선 탭 시 다음 단계로 진행. 완주 인트로가 소비했으면 true 반환. */
  advanceSpeech(): boolean {
    if (this.phase === "speech1wait") {
      this.phase = "eatfp";
      this.timer = 0;
      this.callbacks?.onSpeech(null); // 말풍선 즉시 제거
      return true;
    }
    if (this.phase === "darkfp") {
      this.phase = "eatdarkfp";
      this.timer = 0;
      this.doorScrollY = 0;
      this.eatdarkSpeechActive = true;
      this.callbacks?.onSpeech("발자국을 따라가보자!");
      return true;
    }
    if (this.phase === "eatdarkfp" && this.eatdarkSpeechActive) {
      this.eatdarkSpeechActive = false;
      this.callbacks?.onSpeech(null); // 말풍선 제거, 탭은 소비하지 않아 이동 유지
      return false;
    }
    return false;
  }

  update(
    dtSec: number,
    playerX: number,
    playerY: number,
  ): CompletionIntroUpdateResult {
    this.timer += dtSec;
    const t = this.timer;
    let scrollDelta = 0;
    let newPlayerY: number | null = null;
    let newPlayerX: number | null = null;
    let playerYDelta = 0;

    switch (this.phase) {
      case "showfp":
        for (const fp of this.fps) {
          if (t >= fp.spawnAt) fp.alpha = Math.min(1, (t - fp.spawnAt) / 0.3);
        }
        if (t >= SHOWFP_AUTO_ADVANCE) {
          this.phase = "speech1wait";
          this.timer = 0;
          this.callbacks?.onSpeech("어? 황금 발자국?!");
        }
        break;

      case "speech1wait":
        break;

      case "eatfp": {
        // 배경 고정, 캐릭터가 위로 자동 이동하며 발자국 흡수
        playerYDelta = -WALK_SCROLL_SPEED * dtSec;
        const playerCx = playerX + PLAYER_WIDTH / 2;
        const playerCy = playerY + PLAYER_HEIGHT / 2;
        for (const fp of this.fps) {
          if (fp.eaten) {
            fp.flash = Math.max(0, fp.flash - dtSec * 3);
            continue;
          }
          const dx = fp.x - playerCx;
          const dy = fp.y - playerCy;
          if (Math.sqrt(dx * dx + dy * dy) < EAT_RADIUS + PLAYER_R) {
            fp.eaten = true;
            fp.flash = 1;
            fp.alpha = 0;
          }
        }
        if (this.fps.every((fp) => fp.eaten)) {
          this.phase = "walkoff";
          this.timer = 0;
          this.callbacks?.onSpeech(null); // 황금 발자국 말풍선 제거
          this.initWalkoffFootprints(playerX + PLAYER_WIDTH / 2);
        }
        break;
      }

      case "walkoff": {
        // 캐릭터가 화면 위로 사라질 때까지 계속 이동하며 발자국 수집
        playerYDelta = -WALK_SCROLL_SPEED * dtSec;
        const woCx = playerX + PLAYER_WIDTH / 2;
        const woCy = playerY + PLAYER_HEIGHT / 2;
        for (const fp of this.fps) {
          if (fp.eaten) {
            fp.flash = Math.max(0, fp.flash - dtSec * 3);
            continue;
          }
          const dx = fp.x - woCx;
          const dy = fp.y - woCy;
          if (Math.sqrt(dx * dx + dy * dy) < EAT_RADIUS + PLAYER_R) {
            fp.eaten = true;
            fp.flash = 1;
            fp.alpha = 0;
          }
        }
        if (playerY + PLAYER_HEIGHT < 0) {
          this.phase = "fadeout";
          this.timer = 0;
          this.fps = [];
        }
        break;
      }

      case "fadeout":
        this.fadeAlpha = Math.min(1, t / DUR_FADEOUT);
        if (t >= DUR_FADEOUT) {
          this.phase = "darkfp";
          this.timer = 0;
          this.fadeAlpha = 1;
          this.initDarkFootprints();
          newPlayerX = this.canvasW / 2 - PLAYER_WIDTH / 2;
          newPlayerY = this.canvasH + PLAYER_HEIGHT; // 화면 아래에서 시작
          // eatfp와 동일한 속도(WALK_SCROLL_SPEED)로 올라오는 시간 계산
          this.charEnterDur = (this.canvasH + PLAYER_HEIGHT - this.playerStartY) / WALK_SCROLL_SPEED;
        }
        break;

      case "darkfp": {
        // ① 캐릭터 아래에서 위로 슬라이드 (ease-out cubic, eatfp와 동일 속도)
        const enterProgress = Math.min(1, t / this.charEnterDur);
        const eased = 1 - Math.pow(1 - enterProgress, 3);
        newPlayerY =
          this.canvasH +
          PLAYER_HEIGHT +
          (this.playerStartY - this.canvasH - PLAYER_HEIGHT) * eased;

        // ② 발자국: 캐릭터 도착 후부터 등장
        const fpT = t - this.charEnterDur;
        if (fpT > 0) {
          for (const fp of this.fps) {
            if (fpT >= fp.spawnAt)
              fp.alpha = Math.min(1, (fpT - fp.spawnAt) / 0.35);
          }
        }
        // ③ 문: 발자국 다 나온 뒤 등장
        if (t >= this.charEnterDur + DOOR_SPAWN_AT) {
          this.doorAlpha = Math.min(
            1,
            (t - this.charEnterDur - DOOR_SPAWN_AT) / 0.6,
          );
        }
        if (t >= this.charEnterDur + DUR_DARKFP) {
          this.phase = "eatdarkfp";
          this.timer = 0;
          this.doorScrollY = 0;
          this.eatdarkSpeechActive = true;
          this.callbacks?.onSpeech("발자국을 따라가보자!");
        }
        break;
      }

      case "eatdarkfp": {
        // 발자국은 고정 — 플레이어가 직접 이동해서 수집
        const playerCx = playerX + PLAYER_WIDTH / 2;
        const playerCy = playerY + PLAYER_HEIGHT / 2;

        for (const fp of this.fps) {
          if (fp.eaten) {
            fp.flash = Math.max(0, fp.flash - dtSec * 3);
            continue;
          }
          const dx = fp.x - playerCx;
          const dy = fp.y - playerCy;
          if (Math.sqrt(dx * dx + dy * dy) < EAT_RADIUS + PLAYER_R) {
            fp.eaten = true;
            fp.flash = 1;
            fp.alpha = 0;
          }
        }

        const doorCurrentY = this.canvasH * DOOR_Y_RATIO + this.doorScrollY;
        const allEaten = this.fps.every((fp) => fp.eaten);
        const doorReached = doorCurrentY >= playerY - 60;

        if (allEaten && doorReached) {
          this.phase = "flashwhite";
          this.timer = 0;
          this.callbacks?.onVisualSwitch();
        } else if (doorReached && !allEaten) {
          // 발자국 미수집 상태로 문에 접근 → 힌트 말풍선
          if (this.doorHintCooldown <= 0) {
            this.eatdarkSpeechActive = true;
            this.doorHintCooldown = 4.0;
            this.callbacks?.onSpeech("발자국이 남아있어!");
          }
        }

        if (this.doorHintCooldown > 0) this.doorHintCooldown -= dtSec;
        break;
      }

      case "flashwhite": {
        const half = DUR_FLASHWHITE / 2;
        if (t < half) {
          this.whiteAlpha = t / half;
          this.fadeAlpha = Math.max(0, 1 - t / half);
        } else {
          this.whiteAlpha = Math.max(0, 1 - (t - half) / half);
          this.fadeAlpha = 0;
        }
        if (t >= DUR_FLASHWHITE) {
          this.phase = "done";
          this.fadeAlpha = 0;
          this.whiteAlpha = 0;
          this.fps = [];
          this.doorAlpha = 0;
          newPlayerY = this.playerStartY;
          this.callbacks?.onThemeSwitch(); // 진입 즉시 테마 전환 → 토스트는 useGame에서
        }
        break;
      }
    }

    return { scrollDelta, newPlayerY, newPlayerX, playerYDelta };
  }

  /** walkoff 단계 전환 시 호출 — 마지막 eatfp 발자국 위쪽부터 화면 밖까지 발자국 배치 */
  private initWalkoffFootprints(playerCx: number) {
    const lastFpY =
      this.playerStartY - SHOW_FP_Y_OFFSET - (FP_COUNT - 1) * SHOW_FP_Y_GAP;
    const topY = -(PLAYER_HEIGHT + 20);
    const count = Math.max(3, Math.ceil((lastFpY - topY) / SHOW_FP_Y_GAP));
    this.fps = Array.from({ length: count }, (_, i) => ({
      x:
        playerCx + SHOW_FP_X_OFFSETS[(FP_COUNT + i) % SHOW_FP_X_OFFSETS.length],
      y: lastFpY - (i + 1) * SHOW_FP_Y_GAP,
      alpha: 1,
      eaten: false,
      flash: 0,
      spawnAt: 0,
    }));
  }

  /** darkfp 단계 전환 시 호출 — playerStartY 에서 달빛문 바로 앞까지 균등 배치 */
  private initDarkFootprints() {
    const cx = this.canvasW / 2;
    const firstFpY = this.playerStartY - SHOW_FP_Y_OFFSET;
    // 달빛문 구조: archY = doorY + 36, pillarH = 70 → 문 입구 안쪽 하단 근처
    const doorY   = this.canvasH * DOOR_Y_RATIO;
    const lastFpY = doorY + 36 + 55; // 문 기둥 안쪽 하단
    const gap     = (firstFpY - lastFpY) / (FP_COUNT - 1);
    this.fps = Array.from({ length: FP_COUNT }, (_, i) => ({
      x: cx + SHOW_FP_X_OFFSETS[i],
      y: firstFpY - i * gap,
      alpha: 0,
      eaten: false,
      flash: 0,
      spawnAt: DARK_FP_SPAWN_DELAYS[i],
    }));
    this.doorAlpha = 0;
    this.doorScrollY = 0;
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    aliveTime: number,
    goldenFpImg: HTMLCanvasElement | HTMLImageElement,
  ) {
    if (this.fadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.fadeAlpha;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    if (this.whiteAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.whiteAlpha;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    for (const fp of this.fps) {
      const a = fp.flash > 0 ? fp.flash : fp.alpha;
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = fp.flash > 0 ? 50 : 24 + Math.sin(aliveTime * 3) * 8;
      ctx.drawImage(
        goldenFpImg,
        fp.x - FP_RADIUS,
        fp.y - FP_RADIUS,
        FP_RADIUS * 2,
        FP_RADIUS * 2,
      );
      ctx.restore();
    }

    if (this.doorAlpha > 0) {
      const doorY =
        this.phase === "eatdarkfp"
          ? this.canvasH * DOOR_Y_RATIO + this.doorScrollY
          : this.canvasH * DOOR_Y_RATIO;
      this.drawDoor(ctx, width / 2, doorY, this.doorAlpha, aliveTime);
    }
  }

  private drawDoor(
    ctx: CanvasRenderingContext2D,
    cx: number,
    y: number,
    alpha: number,
    aliveTime: number,
  ) {
    const glow = 0.8 + Math.sin(aliveTime * 2) * 0.2;
    const pulse = 0.85 + Math.sin(aliveTime * 3) * 0.15;
    const archR = 36;
    const archY = y + archR;
    const pillarW = 6;
    const pillarH = 70;
    const iL = cx - archR + pillarW + 1;
    const iR = cx + archR - pillarW - 1;
    const iW = iR - iL;

    ctx.save();
    ctx.globalAlpha = alpha;

    // ── 1. 내부 클립 후 반짝이 효과 ──────────────────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, archY, archR - pillarW / 2, Math.PI, 0);
    ctx.lineTo(iR, archY + pillarH);
    ctx.lineTo(iL, archY + pillarH);
    ctx.closePath();
    ctx.clip();

    // 내부 밝은 그라디언트
    const ig = ctx.createRadialGradient(
      cx, archY + pillarH * 0.15, 2,
      cx, archY + pillarH * 0.4, archR + 18,
    );
    ig.addColorStop(0,   `rgba(255,255,220,${0.92 * pulse})`);
    ig.addColorStop(0.4, `rgba(255,220,60,${0.55 * pulse})`);
    ig.addColorStop(1,   "rgba(200,130,0,0.04)");
    ctx.fillStyle = ig;
    ctx.fillRect(iL - 2, archY - archR, iW + 4, pillarH + archR + 2);

    // 방사형 빛줄기
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10 + aliveTime * 0.45;
      const len = 26 + Math.sin(aliveTime * 2.3 + i * 0.85) * 11;
      const rayAlpha = (0.22 + Math.sin(aliveTime * 1.7 + i * 1.2) * 0.14) * glow;
      ctx.save();
      ctx.globalAlpha = alpha * rayAlpha;
      ctx.strokeStyle = "#FFF8C0";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, archY - archR * 0.05);
      ctx.lineTo(
        cx + Math.cos(angle) * len,
        archY - archR * 0.05 + Math.sin(angle) * len,
      );
      ctx.stroke();
      ctx.restore();
    }

    // ✦ 반짝이 파티클
    for (let i = 0; i < 14; i++) {
      const px =
        iL + 3 + ((Math.sin(i * 2.5 + aliveTime * 0.38) + 1) / 2) * (iW - 6);
      const py =
        archY -
        archR * 0.72 +
        ((Math.cos(i * 1.83 + aliveTime * 0.27) + 1) / 2) *
          (pillarH + archR * 0.72 - 6);
      const sa = (Math.sin(aliveTime * 2.1 + i * 1.37) + 1) / 2;
      const sz = 1.4 + Math.sin(i * 1.1 + aliveTime * 1.6) * 0.8;
      ctx.save();
      ctx.globalAlpha = alpha * sa * 0.95;
      ctx.fillStyle = i % 3 === 0 ? "#ffffff" : "#FFE566";
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const a = (p * Math.PI) / 4 - Math.PI / 2;
        const r = p % 2 === 0 ? sz * 2.4 : sz * 0.55;
        const sx = px + Math.cos(a) * r;
        const sy = py + Math.sin(a) * r;
        if (p === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // 클립 해제

    // ── 2. 외곽 발광 ──────────────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = alpha * (0.35 + Math.sin(aliveTime * 2.2) * 0.1);
    const og = ctx.createRadialGradient(cx, archY, 0, cx, archY, archR + 38);
    og.addColorStop(0, "rgba(255,220,80,0.45)");
    og.addColorStop(1, "rgba(255,180,0,0)");
    ctx.fillStyle = og;
    ctx.fillRect(cx - archR - 42, y - 14, (archR + 42) * 2, pillarH + archR + 24);
    ctx.restore();

    // ── 3. 기둥 · 아치 · 장식 ─────────────────────────────────────────────
    ctx.shadowColor = "#C8A000";
    ctx.shadowBlur = 28 * glow;
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(cx - archR - pillarW / 2, archY, pillarW, pillarH);
    ctx.fillRect(cx + archR - pillarW / 2, archY, pillarW, pillarH);

    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = pillarW;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, archY, archR, Math.PI, 0);
    ctx.stroke();

    ctx.shadowBlur = 18 * glow;
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(cx - archR, archY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + archR, archY, 5, 0, Math.PI * 2);
    ctx.fill();

    const mx = cx + archR * 0.3;
    const my = archY - archR * 0.55;
    ctx.shadowBlur = 20 * glow;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1A1A4A";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(mx + 4, my - 1, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 12;
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("달빛길", cx, archY + pillarH * 0.55);

    ctx.restore();
  }

  reset() {
    this.phase = "idle";
    this.timer = 0;
    this.fadeAlpha = 0;
    this.whiteAlpha = 0;
    this.fps = [];
    this.doorAlpha = 0;
    this.doorScrollY = 0;
    this.eatdarkSpeechActive = false;
    this.doorHintCooldown = 0;
    this.callbacks = null;
  }
}
