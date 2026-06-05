import bgmSrc from '../assets/sounds/bgm-main.mp3';

class AudioManager {
  private bgm: HTMLAudioElement;

  constructor() {
    this.bgm = new Audio(bgmSrc);
    this.bgm.loop = true;
    this.bgm.volume = 0.4;
  }

  playBGM() {
    if (this.bgm.paused) {
      this.bgm.currentTime = 0;
      this.bgm.play().catch(() => {}); // 브라우저 자동재생 정책 무시
    }
  }

  stopBGM() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }

  setBGMVolume(v: number) {
    this.bgm.volume = Math.max(0, Math.min(1, v));
  }
}

export const audioManager = new AudioManager();
