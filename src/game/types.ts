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

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'rock' | 'puddle';
  style?: 'dodger';
  dodgerType?: 'squirrel' | 'hiker';
  driftVx?: number;
  noticed?: boolean;
  noticedAt?: number;
}

export interface GameStats {
  score: number;
  gaugeCount: number;      // 물병 게이지 (0~10)
  distanceMeters: number;
  isPowerMode: boolean;
  powerTimeLeft: number;   // 파워모드 남은 시간(초)
}

export interface Milestone {
  distance: number;
  emoji: string;
  label: string;
}
