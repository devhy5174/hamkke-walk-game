import bgmSrc from '../assets/sounds/bgm-main.mp3';
import sfxWaterSrc from '../assets/sounds/sfx-water.mp3';

class AudioManager {
  private bgm: HTMLAudioElement;
  private sfxWater: HTMLAudioElement;

  constructor() {
    this.bgm = new Audio(bgmSrc);
    this.bgm.loop = true;
    this.bgm.volume = 0.4;

    this.sfxWater = new Audio(sfxWaterSrc);
    this.sfxWater.volume = 0.7;
  }

  playBGM() {
    if (this.bgm.paused) {
      this.bgm.currentTime = 0;
      this.bgm.play().catch(() => {});
    }
  }

  stopBGM() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }

  playWater() {
    this.sfxWater.currentTime = 0;
    this.sfxWater.play().catch(() => {});
    setTimeout(() => {
      this.sfxWater.pause();
      this.sfxWater.currentTime = 0;
    }, 1500);
  }

  setBGMVolume(v: number) {
    this.bgm.volume = Math.max(0, Math.min(1, v));
  }
}

export const audioManager = new AudioManager();
