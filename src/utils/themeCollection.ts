const KEY = 'hamkke-walk-theme-collection';

export function getUnlockedThemes(): string[] {
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
