const KEY = 'hamkke-walk-theme-collection';

export function getUnlockedThemes(): string[] {
  // TODO: 테스트용 전체 해금 — 확인 후 원복 필요
  return ['park', 'forest', 'autumn', 'cherry', 'snow', 'bamboo', 'moonlight'];
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
    return saved.includes('park') ? saved : ['park', ...saved];
  } catch {
    return ['park'];
  }
}

export function unlockTheme(id: string): void {
  const current = getUnlockedThemes();
  if (!current.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...current, id]));
  }
}
