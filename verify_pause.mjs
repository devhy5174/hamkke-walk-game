import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 480, height: 860 } });
const page = await context.newPage();

const logs = [];
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => logs.push(`[ERROR] ${e.message}`));

await page.goto('http://localhost:5175');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/01_main.png' });
console.log('1. Main screen loaded');

// 걷기 시작 버튼 클릭
await page.click('button:has-text("걷기 시작")');
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/02_game_running.png' });
console.log('2. Game started');

// visibilitychange 이벤트 수동 발화 (hidden = true)
const pauseResult = await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
  return document.hidden;
});
console.log('3. visibilitychange fired, document.hidden =', pauseResult);
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/03_paused.png' });

// 일시정지 오버레이 확인
const pauseOverlayVisible = await page.locator('text=일시정지').isVisible().catch(() => false);
const continueBtn = await page.locator('button:has-text("계속하기")').isVisible().catch(() => false);
console.log('4. Pause overlay visible:', pauseOverlayVisible, '| Continue button:', continueBtn);

// 계속하기 버튼 클릭
if (continueBtn) {
  await page.click('button:has-text("계속하기")');
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/04_countdown_3.png' });

  // 카운트다운 숫자 확인
  const count3 = await page.locator('.pause-countdown').textContent().catch(() => null);
  console.log('5. Countdown shows:', count3);

  await page.waitForTimeout(1100);
  const count2 = await page.locator('.pause-countdown').textContent().catch(() => null);
  console.log('6. Countdown 2:', count2);
  await page.screenshot({ path: '/tmp/05_countdown_2.png' });

  await page.waitForTimeout(1100);
  const count1 = await page.locator('.pause-countdown').textContent().catch(() => null);
  console.log('7. Countdown 1:', count1);

  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/06_resumed.png' });
  const overlayGone = !(await page.locator('text=일시정지').isVisible().catch(() => true));
  console.log('8. Overlay dismissed after countdown:', overlayGone);
}

// visibilitychange 복원 (hidden = false) - 재개 확인
await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/07_after_resume.png' });

// 게임이 다시 돌아가고 있는지 (HUD 점수 변하는지)
const score1 = await page.locator('text=점수').locator('..').textContent().catch(() => '');
await page.waitForTimeout(1500);
const score2 = await page.locator('text=점수').locator('..').textContent().catch(() => '');
console.log('9. Score before:', score1?.trim().slice(0,30), '| after 1.5s:', score2?.trim().slice(0,30));

console.log('\nConsole logs:', logs.slice(0,10));
await browser.close();
