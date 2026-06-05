import type { Milestone } from "./types";

export const PLAYER_WIDTH = 36;
export const PLAYER_HEIGHT = 52;
export const PLAYER_SPEED = 270;
export const PLAYER_Y_RATIO = 0.77;

export const ROAD_L = 0.07;
export const ROAD_R = 0.93;

// 발자국 (메인 점수 아이템)
export const FOOTPRINT_RADIUS = 20;
export const FOOTPRINT_SPAWN_MS = 800;
export const FOOTPRINT_SCORE = 10;

// 물병 (게이지 아이템)
export const WATER_RADIUS = 25;
export const WATER_BASE_SPEED = 145;
export const WATER_SPAWN_MS = 2500;

// 장애물 — 난이도 완화
export const OBSTACLE_BASE_SPEED = 125; // 158 → 125
export const OBSTACLE_SPAWN_MS = 2400; // 1800 → 2400ms
export const ROCK_WIDTH = 55;
export const ROCK_HEIGHT = 60;
export const PUDDLE_WIDTH = 75; // 76 → 72 (웅덩이 조금 좁게)
export const PUDDLE_HEIGHT = 55;

// 시계 아이템 (속도 감소)
export const CLOCK_RADIUS = 16;
export const CLOCK_SPAWN_MS = 5500;  // 물병(2500)보다 2배 이상 희귀
export const SLOW_DURATION = 6;      // 초
export const SLOW_FACTOR = 0.5;      // 슬로우 중 속도 배율 (절반)

// 파워워커 모드
export const GAUGE_CAPACITY = 10;
export const POWER_DURATION = 5;
export const POWER_SCORE_MULT = 2;
export const POWER_SPEED_BOOST = 1.7;

// 속도 증가율 완화 (0.05 → 0.03)
export const SPEED_RAMP = 0.03;

// 거리 기본 배율 — 2.5m/s 기준으로 테마 구간을 빠르게 경험
export const DISTANCE_SPEED = 2.5;

// 마일스톤 — 거리 배율에 맞게 조정
export const MILESTONES: Milestone[] = [
  { distance: 50, emoji: "🚶", label: "산책 시작" },
  { distance: 150, emoji: "🚶‍♀️", label: "산책러" },
  { distance: 350, emoji: "⚡", label: "파워워커" },
  { distance: 600, emoji: "🏃", label: "러너" },
  { distance: 1200, emoji: "🥾", label: "등산러" },
];
