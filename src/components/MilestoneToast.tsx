import type { Milestone } from '../game/types';

interface Props {
  milestone: Milestone | null;
}

export function MilestoneToast({ milestone }: Props) {
  if (!milestone) return null;

  return (
    <div className="milestone-toast">
      <span className="milestone-emoji">{milestone.emoji}</span>
      <div className="milestone-text">
        <span className="milestone-dist">{milestone.distance}m 달성!</span>
        <span className="milestone-label">{milestone.label}</span>
      </div>
    </div>
  );
}
