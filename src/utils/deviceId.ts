const KEY = 'hamkke-walk-device-id';

export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    // 처음 실행 시 랜덤 UUID 생성 후 영구 저장
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
