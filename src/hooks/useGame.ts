import { useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameStats, Milestone } from '../game/types';
import { type GameTheme, THEMES } from '../game/themes';

export function useGame(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<GameEngine | null>(null);
  const scoreRef = useRef(0);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [score, setScore] = useState(0);
  const [gaugeCount, setGaugeCount] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [powerTimeLeft, setPowerTimeLeft] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(THEMES[0]);
  const [activeThemeToast, setActiveThemeToast] = useState<GameTheme | null>(null);

  const handleUpdate = useCallback((stats: GameStats) => {
    scoreRef.current = stats.score;
    setScore(stats.score);
    setGaugeCount(stats.gaugeCount);
    setDistanceMeters(stats.distanceMeters);
    setIsPowerMode(stats.isPowerMode);
    setPowerTimeLeft(stats.powerTimeLeft);
  }, []);

  const handleGameOver = useCallback(() => {
    setBestScore(prev => Math.max(prev, scoreRef.current));
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

  const handleThemeChange = useCallback((theme: GameTheme) => {
    setCurrentTheme(theme);
    if (themeToastTimer.current) clearTimeout(themeToastTimer.current);
    setActiveThemeToast(theme);
    themeToastTimer.current = setTimeout(() => {
      setActiveThemeToast(null);
      themeToastTimer.current = null;
    }, 2800);
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (milestoneTimer.current) { clearTimeout(milestoneTimer.current); milestoneTimer.current = null; }
    if (themeToastTimer.current) { clearTimeout(themeToastTimer.current); themeToastTimer.current = null; }
    setActiveMilestone(null);
    setActiveThemeToast(null);
    setCurrentTheme(THEMES[0]);

    engineRef.current?.stop();
    engineRef.current = new GameEngine(canvas, handleUpdate, handleGameOver, handleMilestone, handleThemeChange);

    scoreRef.current = 0;
    setScore(0);
    setGaugeCount(0);
    setDistanceMeters(0);
    setIsPowerMode(false);
    setPowerTimeLeft(0);
    setGameOver(false);
    setIsStarted(true);
    engineRef.current.start();
  }, [canvasRef, handleUpdate, handleGameOver, handleMilestone, handleThemeChange]);

  return {
    score, gaugeCount, distanceMeters, isPowerMode, powerTimeLeft,
    bestScore, gameOver, isStarted,
    currentTheme, activeMilestone, activeThemeToast,
    startGame, engineRef,
  };
}
