import type { Footprint, WaterBottle, ClockItem, Obstacle } from './types';
import {
  FOOTPRINT_RADIUS,
  WATER_RADIUS,
  CLOCK_RADIUS,
  ROCK_WIDTH, ROCK_HEIGHT,
  PUDDLE_WIDTH, PUDDLE_HEIGHT,
  ROAD_L, ROAD_R,
} from './constants';

let uid = 0;

export function makeFootprint(canvasWidth: number): Footprint {
  const left = canvasWidth * ROAD_L + FOOTPRINT_RADIUS;
  const right = canvasWidth * ROAD_R - FOOTPRINT_RADIUS;
  return { id: uid++, x: left + Math.random() * (right - left), y: -FOOTPRINT_RADIUS * 2, radius: FOOTPRINT_RADIUS };
}

export function makeWaterBottle(canvasWidth: number): WaterBottle {
  const left = canvasWidth * ROAD_L + WATER_RADIUS;
  const right = canvasWidth * ROAD_R - WATER_RADIUS;
  return { id: uid++, x: left + Math.random() * (right - left), y: -WATER_RADIUS * 2, radius: WATER_RADIUS };
}

export function makeClockItem(canvasWidth: number): ClockItem {
  const left = canvasWidth * ROAD_L + CLOCK_RADIUS;
  const right = canvasWidth * ROAD_R - CLOCK_RADIUS;
  return { id: uid++, x: left + Math.random() * (right - left), y: -CLOCK_RADIUS * 2, radius: CLOCK_RADIUS };
}

export function makeObstacle(canvasWidth: number): Obstacle {
  const variant: 'rock' | 'puddle' = Math.random() < 0.5 ? 'rock' : 'puddle';
  const w = variant === 'rock' ? ROCK_WIDTH : PUDDLE_WIDTH;
  const h = variant === 'rock' ? ROCK_HEIGHT : PUDDLE_HEIGHT;
  const left = canvasWidth * ROAD_L + 4;
  const right = canvasWidth * ROAD_R - w - 4;
  return { id: uid++, x: left + Math.random() * (right - left), y: -(h + 10), width: w, height: h, variant };
}
