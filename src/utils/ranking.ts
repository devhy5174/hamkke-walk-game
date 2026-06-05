import { ref, push, update, query, orderByChild, limitToLast, limitToFirst, equalTo, get } from 'firebase/database';
import { db } from '../firebase';
import { getDeviceId } from './deviceId';

export interface RankEntry {
  id: string;
  nickname: string;
  score: number;
  distanceMeters: number;
  date: string;
  deviceId?: string;
}

// 점수·거리 각각 독립적으로 최고기록 갱신
// 다른 기기에서 이미 등록된 닉네임은 차단
export async function upsertRanking(
  nickname: string,
  score: number,
  distanceMeters: number,
): Promise<string> {
  const deviceId = getDeviceId();

  const q = query(
    ref(db, 'rankings'),
    orderByChild('nickname'),
    equalTo(nickname),
    limitToFirst(1),
  );
  const snapshot = await get(q);

  if (snapshot.exists()) {
    let existingKey = '';
    let existingVal: Record<string, unknown> = {};
    snapshot.forEach(child => {
      existingKey = child.key!;
      existingVal = child.val();
    });

    // 다른 기기에서 등록한 닉네임 → 차단
    if (existingVal.deviceId && existingVal.deviceId !== deviceId) {
      throw new Error('NICKNAME_TAKEN');
    }

    const existingScore = (existingVal.score as number) ?? 0;
    const existingDist  = (existingVal.distanceMeters as number) ?? 0;

    const scoreBeat = score > existingScore;
    const distBeat  = distanceMeters > existingDist;

    // 점수도 거리도 모두 기존보다 낮으면 거부
    if (!scoreBeat && !distBeat) {
      throw new Error(`NOT_BEATEN:${existingScore}:${existingDist}`);
    }

    // 각각 더 높은 값으로만 갱신
    await update(ref(db, `rankings/${existingKey}`), {
      nickname,
      deviceId,
      score:          scoreBeat ? score          : existingScore,
      distanceMeters: distBeat  ? distanceMeters : existingDist,
      date: new Date().toISOString(),
    });
    return existingKey;
  } else {
    // 새 닉네임 등록
    const result = await push(ref(db, 'rankings'), {
      nickname, score, distanceMeters, deviceId,
      date: new Date().toISOString(),
    });
    return result.key!;
  }
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

export async function getTopRankingsByDistance(limit = 50): Promise<RankEntry[]> {
  const q = query(ref(db, 'rankings'), orderByChild('distanceMeters'), limitToLast(limit));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];

  const entries: RankEntry[] = [];
  snapshot.forEach(child => {
    entries.push({ id: child.key!, ...child.val() });
  });
  return entries.sort((a, b) => b.distanceMeters - a.distanceMeters);
}

const NK_KEY = 'hamkke-walk-nickname';
export const getSavedNickname = (): string => localStorage.getItem(NK_KEY) ?? '';
export const persistNickname = (n: string): void => { localStorage.setItem(NK_KEY, n); };
