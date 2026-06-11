import { Capacitor } from '@capacitor/core';

/** Android/iOS 네이티브 앱 여부 (false = 토스 미니앱 또는 브라우저) */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** 광고 슬롯 하단 높이 — 네이티브: 60px, 토스/웹: 0px */
export const AD_BOTTOM_OFFSET = isNativeApp() ? 60 : 0;
