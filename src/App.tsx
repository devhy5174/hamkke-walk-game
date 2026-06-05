import { useRef, useState } from 'react';
import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { MilestoneToast } from './components/MilestoneToast';
import { ThemeToast } from './components/ThemeToast';
import { PowerOverlay } from './components/PowerOverlay';
import { RecordsModal } from './components/RecordsModal';
import { RankingModal } from './components/RankingModal';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    score, gaugeCount, distanceMeters, isPowerMode, powerTimeLeft,
    bestScore, gameOver, isStarted,
    currentTheme, activeMilestone, activeThemeToast,
    startGame, engineRef,
  } = useGame(canvasRef);

  const [showRecords, setShowRecords] = useState(false);
  const [showRanking, setShowRanking] = useState(false);

  return (
    <div className="app">
      <GameCanvas canvasRef={canvasRef} engineRef={engineRef} />

      {isStarted && (
        <GameHUD
          score={score}
          bestScore={bestScore}
          distanceMeters={distanceMeters}
          gaugeCount={gaugeCount}
          isPowerMode={isPowerMode}
          powerTimeLeft={powerTimeLeft}
          currentTheme={currentTheme}
        />
      )}
      {isStarted && <MilestoneToast milestone={activeMilestone} />}
      {isStarted && <ThemeToast theme={activeThemeToast} />}
      {isStarted && <PowerOverlay isPowerMode={isPowerMode} powerTimeLeft={powerTimeLeft} />}

      {!isStarted && (
        <div className="overlay">
          <div className="start-card">
            <div style={{ fontSize: '3.2rem', marginBottom: 10 }}>🚶</div>
            <h1 className="game-title">함께Walk</h1>
            <p className="game-desc">
              발자국을 모으고 물병으로<br />에너지를 충전해 보세요!
            </p>
            <div className="hint-row">
              <span className="hint">🟡 발자국 수집 → 점수 획득</span>
              <span className="hint">💧 물병 10개 → 파워워커 발동</span>
              <span className="hint">🪨 돌·웅덩이 → 피하거나 무적으로!</span>
            </div>
            <button className="btn-primary" onClick={startGame}>
              걷기 시작 🌿
            </button>
            <button className="btn-secondary" onClick={() => setShowRecords(true)}>
              🏆 내 기록 보기
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          distanceMeters={distanceMeters}
          onRestart={startGame}
          onShowRecords={() => setShowRecords(true)}
          onShowRanking={() => setShowRanking(true)}
        />
      )}

      {showRecords && <RecordsModal onClose={() => setShowRecords(false)} />}
      {showRanking && (
        <RankingModal
          score={score}
          distanceMeters={distanceMeters}
          onClose={() => setShowRanking(false)}
        />
      )}
    </div>
  );
}

export default App;
