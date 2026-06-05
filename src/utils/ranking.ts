import { ref, push, query, orderByChild, limitToLast, limitToFirst, equalTo, get } from 'firebase/database';
import { db } from '../firebase';

export interface RankEntry {
  id: string;
  nickname: string;
  score: number;
  distanceMeters: number;
  date: string;
}

export async function submitRanking(
  nickname: string,
  score: number,
  distanceMeters: number,
): Promise<string> {
  const result = await push(ref(db, 'rankings'), {
    nickname,
    score,
    distanceMeters,
    date: new Date().toISOString(),
  });
  return result.key!;
}

export async function isNicknameAvailable(nickname: string): Promise<boolean> {
  const q = query(
    ref(db, 'rankings'),
    orderByChild('nickname'),
    equalTo(nickname),
    limitToFirst(1),
  );
  const snapshot = await get(q);
  return !snapshot.exists();
}

export async function getTopRankings(limit = 50): Promise<RankEntry[]> {
  const q = query(ref(db, 'rankings'), orderByChild('score'), limitToLast(limit));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];

  const entries: RankEntry[] = [];
  snapshot.forEach(child => {
    entries.push({ id: child.key!, ...child.val() });
  });
  return entries.sort((a, b) => b.score - a.score);
}

// 마지막 닉네임 기억
const NK_KEY = 'hamkke-walk-nickname';
export const getSavedNickname = (): string => localStorage.getItem(NK_KEY) ?? '';
export const persistNickname = (n: string): void => { localStorage.setItem(NK_KEY, n); };
