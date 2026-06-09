import bgmSrc from '../assets/sounds/bgm-main.mp3';
import bgmFinishedSrc from '../assets/sounds/bgm_finished.mp3';
import sfxWaterSrc from '../assets/sounds/sfx-water.mp3';

class AudioManager {
  private bgm: HTMLAudioElement;
  private bgmFinished: HTMLAudioElement;
  private currentBgm: 'main' | 'finished' = 'main';
  private _muted: boolean = false;

  // Web Audio API — sfx 재생 시 iOS 메인 스레드 블로킹 방지
  private audioCtx: AudioContext | null = null;
  private waterBuffer: AudioBuffer | null = null;
  private gainNode: GainNode | null = null;
  private unlocked = false;

  constructor() {
    this.bgm = new Audio(bgmSrc);
    this.bgm.loop = true;
    this.bgm.volume = 0.4;

    this.bgmFinished = new Audio(bgmFinishedSrc);
    this.bgmFinished.loop = true;
    this.bgmFinished.volume = 0.4;

    this._muted = localStorage.getItem('hamkke_muted') === 'true';
    this.bgm.muted = this._muted;
    this.bgmFinished.muted = this._muted;
  }

  get muted() {
    return this._muted;
  }

  /** 첫 터치 시 호출 — iOS AudioContext 언락 + 물병 SFX 미리 디코딩 */
  unlockAudio() {
    if (this.unlocked) return;
    this.unlocked = true;

    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new Ctx();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this._muted ? 0 : 0.7;
      this.gainNode.connect(this.audioCtx.destination);

      // 오디오 파일 미리 디코딩
      fetch(sfxWaterSrc)
        .then(r => r.arrayBuffer())
        .then(ab => this.audioCtx!.decodeAudioData(ab))
        .then(buf => { this.waterBuffer = buf; })
        .catch(() => {});
    } catch {
      // 지원 안 되는 환경: 무시
    }
  }

  toggleMute() {
    this._muted = !this._muted;
    this.bgm.muted = this._muted;
    this.bgmFinished.muted = this._muted;
    if (this.gainNode) this.gainNode.gain.value = this._muted ? 0 : 0.7;
    localStorage.setItem('hamkke_muted', String(this._muted));
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
    if (this.audioCtx && this.waterBuffer && this.gainNode) {
      // Web Audio API: 버퍼 재생 — iOS 메인 스레드 블로킹 없음
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const src = this.audioCtx.createBufferSource();
      src.buffer = this.waterBuffer;
      src.connect(this.gainNode);
      src.start(0);
      src.stop(this.audioCtx.currentTime + 1.5);
    } else {
      // fallback: HTMLAudioElement (Web Audio 미지원 환경)
      const clone = this.bgm.cloneNode(false) as HTMLAudioElement;
      // sfx 전용 — bgm 복사 아닌 별도 Audio 생성
      const sfx = new Audio(sfxWaterSrc);
      sfx.volume = this._muted ? 0 : 0.7;
      sfx.play().catch(() => {});
      setTimeout(() => { sfx.pause(); }, 1500);
    }
  }

  pauseBGM() {
    if (this.currentBgm === 'main') this.bgm.pause();
    else this.bgmFinished.pause();
  }

  resumeBGM() {
    if (this.currentBgm === 'main') this.bgm.play().catch(() => {});
    else this.bgmFinished.play().catch(() => {});
  }
}

export const audioManager = new AudioManager();
