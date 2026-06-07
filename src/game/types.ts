export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Footprint {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface WaterBottle {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface ClockItem {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'rock' | 'puddle';
  style?: 'dodger';
  dodgerType?: 'squirrel' | 'hiker' | 'panda';
  driftVx?: number;
  noticed?: boolean;
  noticedAt?: number;
}

export interface GameStats {
  score: number;
  gaugeCount: number;
  distanceMeters: number;
  isPowerMode: boolean;
  powerTimeLeft: number;
  isSlowMode: boolean;
  slowTimeLeft: number;
  moonlightTimeLeft: number;
}

export interface Milestone {
  distance: number;
  emoji: string;
  label: string;
}
