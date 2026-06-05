import { useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameStats, Milestone } from '../game/types';
import { type GameTheme, THEMES } from '../game/themes';
import { saveRecord } from '../utils/records';
import { audioManager } from '../utils/audio';

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
  const [bestScore, setBestScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(THEMES[0]);
  const [activeThemeToast, setActiveThemeToast] = useState<GameTheme | null>(null);

  const handleUpdate = useCallback((stats: GameStats) => {
    scoreRef.current = stats.score;
    distanceRef.current = stats.distanceMeters;
    setScore(stats.score);
    setGaugeCount(stats.gaugeCount);
    setDistanceMeters(stats.distanceMeters);
    setIsPowerMode(stats.isPowerMode);
    setPowerTimeLeft(stats.powerTimeLeft);
  }, []);

  const handleGameOver = useCallback(() => {
    const finalScore = scoreRef.current;
    const finalDist = distanceRef.current;
    setBestScore(prev => Math.max(prev, finalScore));
    audioManager.stopBGM();
    if (finalScore > 0) {
      saveRecord({ score: finalScore, distanceMeters: finalDist, date: new Date().toISOString() });
    }
    setGameEnded(true); // 화면 고정 + 오버레이
  }, []);

  const showResult = useCallback(() => {
    setGameOver(true); // 결과 팝업
  }, []);

  const handleMilestone = useCallback((m: Milestone) => {
    if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
    setActiveMilestone(m);
    milestoneTimer.current = setTimeout(() => {
      setActiveMilestone(null);
      milestoneTimer.current = null;
    }, 2800);
  }, []);

  const handleThemeChange = useCallback((theme: GameTheme) => {
    setCurrentTheme(theme);
    if (themeToastTimer.current) clearTimeout(themeToastTimer.current);
    setActiveThemeToast(theme);
    themeToastTimer.current = setTimeout(() => {
      setActiveThemeToast(null);
      themeToastTimer.current = null;
    }, 2800);
  }, []);

  const startGame = useCallback((charSrc?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (milestoneTimer.current) { clearTimeout(milestoneTimer.current); milestoneTimer.current = null; }
    if (themeToastTimer.current) { clearTimeout(themeToastTimer.current); themeToastTimer.current = null; }
    setActiveMilestone(null);
    setActiveThemeToast(null);
    setCurrentTheme(THEMES[0]);

    engineRef.current?.stop();
    engineRef.current = new GameEngine(canvas, handleUpdate, handleGameOver, handleMilestone, handleThemeChange);
    if (charSrc) engineRef.current.setCharacter(charSrc);

    scoreRef.current = 0;
    setScore(0);
    setGaugeCount(0);
    setDistanceMeters(0);
    setIsPowerMode(false);
    setPowerTimeLeft(0);
    setGameEnded(false);
    setGameOver(false);
    setIsStarted(true);
    engineRef.current.start();
    audioManager.playBGM();
  }, [canvasRef, handleUpdate, handleGameOver, handleMilestone, handleThemeChange]);

  return {
    score, gaugeCount, distanceMeters, isPowerMode, powerTimeLeft,
    bestScore, gameEnded, gameOver, isStarted,
    currentTheme, activeMilestone, activeThemeToast,
    startGame, showResult, engineRef,
  };
}
