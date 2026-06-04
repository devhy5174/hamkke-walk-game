import type { Milestone } from "./types";

export const PLAYER_WIDTH = 36;
export const PLAYER_HEIGHT = 52;
export const PLAYER_SPEED = 270;
export const PLAYER_Y_RATIO = 0.77;

export const ROAD_L = 0.07;
export const ROAD_R = 0.93;

// 발자국 (메인 점수 아이템)
export const FOOTPRINT_RADIUS = 13;
export const FOOTPRINT_SPAWN_MS = 800;
export const FOOTPRINT_SCORE = 10;

// 물병 (게이지 아이템) — 발자국보다 약 3배 드물게
export const WATER_RADIUS = 14;
export const WATER_BASE_SPEED = 145;
export const WATER_SPAWN_MS = 2500;

// 장애물
export const OBSTACLE_BASE_SPEED = 158;
export const OBSTACLE_SPAWN_MS = 1800;
export const ROCK_WIDTH = 48;
export const ROCK_HEIGHT = 44;
export const PUDDLE_WIDTH = 76;
export const PUDDLE_HEIGHT = 26;

// 파워워커 모드
export const GAUGE_CAPACITY = 10;
export const POWER_DURATION = 5;
export const POWER_SCORE_MULT = 2;
export const POWER_SPEED_BOOST = 1.7;

export const SPEED_RAMP = 0.05;

export const MILESTONES: Milestone[] = [
  { distance: 100, emoji: "🚶", label: "산책 시작" },
  { distance: 500, emoji: "🚶‍♀️", label: "산책러" },
  { distance: 1000, emoji: "⚡", label: "파워워커" },
  { distance: 2000, emoji: "🏃", label: "러너" },
  { distance: 5000, emoji: "🥾", label: "등산러" },
];
