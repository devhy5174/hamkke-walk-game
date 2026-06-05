export interface GameRecord {
  score: number;
  distanceMeters: number;
  date: string; // ISO string
}

const KEY = 'hamkke-walk-records';
const MAX = 10;

export function saveRecord(record: GameRecord): void {
  const list = getRecords();
  list.push(record);
  list.sort((a, b) => b.score - a.score);
  list.splice(MAX);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}
