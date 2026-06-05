import { ref, push, set, query, orderByChild, limitToLast, limitToFirst, equalTo, get } from 'firebase/database';
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

// 같은 닉네임이면 업데이트, 없으면 새로 등록
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
    let existingDeviceId = '';
    snapshot.forEach(child => {
      existingKey = child.key!;
      existingDeviceId = child.val().deviceId ?? '';
    });

    // 다른 기기에서 등록한 닉네임 → 차단
    if (existingDeviceId && existingDeviceId !== deviceId) {
      throw new Error('NICKNAME_TAKEN');
    }

    let existingScore = 0;
    snapshot.forEach(child => { existingScore = child.val().score ?? 0; });

    // 기존 최고기록보다 낮으면 업데이트 거부
    if (score <= existingScore) {
      throw new Error(`SCORE_NOT_BEATEN:${existingScore}`);
    }

    // 내 기기 + 신기록 → 업데이트
    await set(ref(db, `rankings/${existingKey}`), {
      nickname, score, distanceMeters, deviceId,
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

const NK_KEY = 'hamkke-walk-nickname';
export const getSavedNickname = (): string => localStorage.getItem(NK_KEY) ?? '';
export const persistNickname = (n: string): void => { localStorage.setItem(NK_KEY, n); };
