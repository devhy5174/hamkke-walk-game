import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import type { BannerAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// ─── 광고 ID 설정 ────────────────────────────────────────────────
// 실제 광고로 전환 시 IS_TEST = false 로 변경
export const IS_TEST = false;

const TEST_BANNER_ID   = 'ca-app-pub-3940256099942544/6300978111'; // Google 공식 테스트 배너 ID
const REAL_BANNER_ID   = 'ca-app-pub-5294050806505689/8251053355';

const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917'; // Google 공식 테스트 보상형 ID
const REAL_REWARDED_ID = 'ca-app-pub-5294050806505689/7490345884';

const BANNER_ID   = IS_TEST ? TEST_BANNER_ID   : REAL_BANNER_ID;
const REWARDED_ID = IS_TEST ? TEST_REWARDED_ID : REAL_REWARDED_ID;
// ─────────────────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null;
let listenersRegistered = false;

function registerBannerListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
    console.log('[AdMob] 배너 광고 로드 성공');
  });
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
    console.error('[AdMob] 배너 광고 로드 실패:', JSON.stringify(error));
  });
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
    console.log('[AdMob] 배너 사이즈:', JSON.stringify(size));
  });
}

export function initAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  if (!initPromise) {
    initPromise = AdMob.initialize().then(() => {
      registerBannerListeners();
    }).catch((e) => {
      console.warn('[AdMob] 초기화 실패:', e);
      initPromise = null;
    }) as Promise<void>;
  }
  return initPromise;
}

// ── 배너 광고 ────────────────────────────────────────────────────

export async function showAdBanner(position: BannerAdPosition): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await initAdMob();
  const options: BannerAdOptions = {
    adId: BANNER_ID,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position,
    margin: 0,
    isTesting: IS_TEST,
  };
  console.log(`[AdMob] 배너 표시 요청 (위치: ${position}, 테스트: ${IS_TEST})`);
  await AdMob.showBanner(options);
}

export async function hideAdBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try { await AdMob.hideBanner(); } catch { /* 배너 없을 때 무시 */ }
}

export async function removeAdBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try { await AdMob.removeBanner(); } catch { /* 배너 없을 때 무시 */ }
}

// ── 보상형 광고 (부활) ───────────────────────────────────────────

/**
 * 보상형 광고를 로드 후 표시.
 * 유저가 끝까지 시청하면 true, 중간에 닫으면 false 반환.
 * 웹 환경에서는 항상 true 반환 (테스트 편의).
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false; // 토스/웹에서 비활성화
  await initAdMob();

  return new Promise<boolean>((resolve) => {
    let rewarded = false;

    const onRewarded = AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      rewarded = true;
    });
    const onDismissed = AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
      (await onRewarded).remove();
      (await onDismissed).remove();
      (await onFailed).remove();
      resolve(rewarded);
    });
    const onFailed = AdMob.addListener(RewardAdPluginEvents.FailedToShow, async (err) => {
      console.error('[AdMob] 보상형 광고 표시 실패:', JSON.stringify(err));
      (await onRewarded).remove();
      (await onDismissed).remove();
      (await onFailed).remove();
      resolve(false);
    });

    AdMob.prepareRewardVideoAd({ adId: REWARDED_ID, isTesting: IS_TEST })
      .then(() => AdMob.showRewardVideoAd())
      .catch(async (e) => {
        console.error('[AdMob] 보상형 광고 로드 실패:', e);
        (await onRewarded).remove();
        (await onDismissed).remove();
        (await onFailed).remove();
        resolve(false);
      });
  });
}

export { BannerAdPosition };
