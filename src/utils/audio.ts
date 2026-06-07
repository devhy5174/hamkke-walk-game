import bgmSrc from '../assets/sounds/bgm-main.mp3';
import bgmFinishedSrc from '../assets/sounds/bgm_finished.mp3';
import sfxWaterSrc from '../assets/sounds/sfx-water.mp3';

class AudioManager {
  private bgm: HTMLAudioElement;
  private bgmFinished: HTMLAudioElement;
  private sfxWater: HTMLAudioElement;
  private currentBgm: 'main' | 'finished' = 'main';

  constructor() {
    this.bgm = new Audio(bgmSrc);
    this.bgm.loop = true;
    this.bgm.volume = 0.4;

    this.bgmFinished = new Audio(bgmFinishedSrc);
    this.bgmFinished.loop = true;
    this.bgmFinished.volume = 0.4;

    this.sfxWater = new Audio(sfxWaterSrc);
    this.sfxWater.volume = 0.7;
  }

  playBGM() {
    this.currentBgm = 'main';
    if (this.bgm.paused) {
      this.bgm.currentTime = 0;
      this.bgm.play().catch(() => {});
    }
  }

  switchToMoonlightBGM() {
    if (this.currentBgm === 'finished') return;
    this.currentBgm = 'finished';
    this.bgm.pause();
    this.bgmFinished.currentTime = 0;
    this.bgmFinished.play().catch(() => {});
  }

  stopBGM() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
    this.bgmFinished.pause();
    this.bgmFinished.currentTime = 0;
    this.currentBgm = 'main';
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
