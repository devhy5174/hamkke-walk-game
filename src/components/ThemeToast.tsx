import type { GameTheme } from '../game/themes';

interface Props {
  theme: GameTheme | null;
}

export function ThemeToast({ theme }: Props) {
  if (!theme) return null;

  return (
    <div className="theme-toast">
      <span className="theme-toast-emoji">{theme.emoji}</span>
      <div className="theme-toast-text">
        <div className="theme-toast-name">{theme.name}</div>
        <div className="theme-toast-sub">새 구간 진입!</div>
      </div>
    </div>
  );
}
