import { useRef, useState, useCallback, useEffect } from "react";
import type { RefObject } from "react";
import { GameEngine } from "../game/GameEngine";
import type { GameStats, Milestone } from "../game/types";
import { type GameTheme, THEMES } from "../game/themes";
import { saveRecord, getRecords } from "../utils/records";
import { unlockTheme } from "../utils/themeCollection";
import { audioManager } from "../utils/audio";

export function useGame(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<GameEngine | null>(null);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [score, setScore] = useState(0);
  const [gaugeCount, setGaugeCount] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [powerTimeLeft, setPowerTimeLeft] = useState(0);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [slowTimeLeft, setSlowTimeLeft] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const records = getRecords();
    return records.length > 0 ? records[0].score : 0;
  });
  const [gameEnded, setGameEnded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [moonlightTimeLeft, setMoonlightTimeLeft] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(
    null,
  );
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(THEMES[0]);
  const [activeThemeToast, setActiveThemeToast] = useState<GameTheme | null>(
    null,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [dodgerMsg, setDodgerMsg] = useState<string | null>(null);
  const dodgerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);

  const pauseGame = useCallback(() => {
    const paused = engineRef.current?.pause();
    if (paused) {
      audioManager.pauseBGM();
      setIsPaused(true);
    }
  }, []);

  const resumeGame = useCallback(() => {
    engineRef.current?.resume();
    audioManager.resumeBGM();
    setIsPaused(false);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) pauseGame();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pauseGame]);

  const handleUpdate = useCallback((stats: GameStats) => {
    scoreRef.current = stats.score;
    distanceRef.current = stats.distanceMeters;
    setScore(stats.score);
    setGaugeCount(stats.gaugeCount);
    setDistanceMeters(stats.distanceMeters);
    setIsPowerMode(stats.isPowerMode);
    setPowerTimeLeft(stats.powerTimeLeft);
    setIsSlowMode(stats.isSlowMode);
    setSlowTimeLeft(stats.slowTimeLeft);
    setMoonlightTimeLeft(stats.moonlightTimeLeft);
  }, []);

  const handleGameOver = useCallback(() => {
    const finalScore = scoreRef.current;
    const finalDist = distanceRef.current;
    setBestScore((prev) => Math.max(prev, finalScore));
    audioManager.stopBGM();
    if (finalScore > 0) {
      saveRecord({
        score: finalScore,
        distanceMeters: finalDist,
        date: new Date().toISOString(),
      });
    }
    setGameEnded(true);
  }, []);

  // 포토모드에서 탭 — 엔진 유지, 완주 오버레이만 표시
  const confirmComplete = useCallback(() => {
    setShowCompletionOverlay(true);
  }, []);

  // 완주 오버레이 → 포토타임으로 돌아가기
  const backToPhotoMode = useCallback(() => {
    setShowCompletionOverlay(false);
  }, []);

  // 완주 오버레이 → 결과 확정 (랭킹 닫은 후 호출)
  const showResult = useCallback(() => {
    saveRecord({
      score: scoreRef.current,
      distanceMeters: distanceRef.current,
      date: new Date().toISOString(),
    });
    engineRef.current?.stop();
    audioManager.stopBGM();
    setShowCompletionOverlay(false);
    setIsPhotoMode(false);
    setGameEnded(true);
    setGameOver(true);
  }, []);

  const handleMilestone = useCallback((m: Milestone) => {
    if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
    setActiveMilestone(m);
    milestoneTimer.current = setTimeout(() => {
      setActiveMilestone(null);
      milestoneTimer.current = null;
    }, 2800);
  }, []);

  const handleDodger = useCallback((msg: string) => {
    if (dodgerTimer.current) clearTimeout(dodgerTimer.current);
    setDodgerMsg(msg);
    dodgerTimer.current = setTimeout(() => {
      setDodgerMsg(null);
      dodgerTimer.current = null;
    }, 2500);
  }, []);

  const handleThemeChange = useCallback(
    (theme: GameTheme) => {
      setCurrentTheme(theme);
      unlockTheme(theme.id);
      if (theme.id === "moonlight") {
        audioManager.switchToMoonlightBGM();
        setTimeout(
          () => handleDodger("믿을 수 없어! 달빛길까지 왔어요! 🌙🎊"),
          800,
        );
        setTimeout(
          () => handleDodger("황금 발자국을 밟으며 별빛 아래 달려요! ✨"),
          4000,
        );
      }
      if (themeToastTimer.current) clearTimeout(themeToastTimer.current);
      setActiveThemeToast(theme);
      themeToastTimer.current = setTimeout(() => {
        setActiveThemeToast(null);
        themeToastTimer.current = null;
      }, 2800);
    },
    [handleDodger],
  );

  const startGame = useCallback(
    (charSrc?: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (milestoneTimer.current) {
        clearTimeout(milestoneTimer.current);
        milestoneTimer.current = null;
      }
      if (themeToastTimer.current) {
        clearTimeout(themeToastTimer.current);
        themeToastTimer.current = null;
      }
      setActiveMilestone(null);
      setActiveThemeToast(null);
      setCurrentTheme(THEMES[0]);

      engineRef.current?.stop();
      engineRef.current = new GameEngine(
        canvas,
        handleUpdate,
        handleGameOver,
        handleMilestone,
        handleThemeChange,
      );
      if (charSrc) engineRef.current.setCharacter(charSrc);
      engineRef.current.setDodgerCallback(handleDodger);
      engineRef.current.setPowerMsgCallback(handleDodger);
      engineRef.current.setFinishReadyCallback(() => {
        setIsPhotoMode(true);
        setIsComplete(true);
        setTimeout(
          () =>
            setPhotoMsg(
              "끝까지 함께 달려줘서 \n고마워요 🌿\n덕분에 정말 즐거운 \n산책이었어요!",
            ),
          1000,
        );
      });

      scoreRef.current = 0;
      setScore(0);
      setGaugeCount(0);
      setDistanceMeters(0);
      setIsPowerMode(false);
      setPowerTimeLeft(0);
      setGameEnded(false);
      setIsSlowMode(false);
      setSlowTimeLeft(0);
      setGameOver(false);
      setIsComplete(false);
      setIsPhotoMode(false);
      setShowCompletionOverlay(false);
      setPhotoMsg(null);
      setMoonlightTimeLeft(0);
      setIsPaused(false);
      setIsStarted(true);
      engineRef.current.start();
      audioManager.playBGM();

      // 게임 시작 인사 말풍선 (0.8초 후 랜덤)
      const startMsgs = [
        "오늘도 화이팅! 💪",
        "날씨 좋다~ 🌤️",
        "같이 걸어요! 🌿",
        "기분 좋은 하루야!",
        "건강한 하루 시작~",
        "준비됐나요? 출발!",
        "오늘 목표 달성하자!",
        "산책 최고야~ 🚶",
      ];
      setTimeout(() => {
        handleDodger(startMsgs[Math.floor(Math.random() * startMsgs.length)]);
      }, 800);
    },
    [
      canvasRef,
      handleUpdate,
      handleGameOver,
      handleMilestone,
      handleThemeChange,
    ],
  );

  return {
    score,
    gaugeCount,
    distanceMeters,
    isPowerMode,
    powerTimeLeft,
    isSlowMode,
    slowTimeLeft,
    bestScore,
    gameEnded,
    gameOver,
    isStarted,
    isPaused,
    currentTheme,
    activeMilestone,
    activeThemeToast,
    dodgerMsg,
    startGame,
    pauseGame,
    resumeGame,
    showResult,
    confirmComplete,
    backToPhotoMode,
    engineRef,
    isComplete,
    isPhotoMode,
    showCompletionOverlay,
    moonlightTimeLeft,
    photoMsg,
  };
}
