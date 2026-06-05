import type { Player, Footprint, WaterBottle, ClockItem, Obstacle } from './types';

export function hitFootprint(player: Player, fp: Footprint): boolean {
  const nearX = Math.max(player.x, Math.min(fp.x, player.x + player.width));
  const nearY = Math.max(player.y, Math.min(fp.y, player.y + player.height));
  const dx = fp.x - nearX;
  const dy = fp.y - nearY;
  return dx * dx + dy * dy < fp.radius * fp.radius;
}

export function hitWaterBottle(player: Player, item: WaterBottle): boolean {
  const nearX = Math.max(player.x, Math.min(item.x, player.x + player.width));
  const nearY = Math.max(player.y, Math.min(item.y, player.y + player.height));
  const dx = item.x - nearX;
  const dy = item.y - nearY;
  return dx * dx + dy * dy < item.radius * item.radius;
}

export function hitClockItem(player: Player, item: ClockItem): boolean {
  const nearX = Math.max(player.x, Math.min(item.x, player.x + player.width));
  const nearY = Math.max(player.y, Math.min(item.y, player.y + player.height));
  const dx = item.x - nearX, dy = item.y - nearY;
  return dx * dx + dy * dy < item.radius * item.radius;
}

export function hitObstacle(player: Player, obs: Obstacle): boolean {
  const shrink = 6;
  return (
    player.x + shrink < obs.x + obs.width &&
    player.x + player.width - shrink > obs.x &&
    player.y + shrink < obs.y + obs.height &&
    player.y + player.height - shrink > obs.y
  );
}
