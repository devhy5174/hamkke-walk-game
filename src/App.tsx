import { useRef, useState } from "react";
import { useGame } from "./hooks/useGame";
import { GameCanvas } from "./components/GameCanvas";
import { GameHUD } from "./components/GameHUD";
import { GameOverModal } from "./components/GameOverModal";
import { MilestoneToast } from "./components/MilestoneToast";
import { ThemeToast } from "./components/ThemeToast";
import { PowerOverlay } from "./components/PowerOverlay";
import { RecordsModal } from "./components/RecordsModal";
import { RankingModal } from "./components/RankingModal";
import { ThemeCollectionModal } from "./components/ThemeCollectionModal";
import { CharacterSelect } from "./components/CharacterSelect";
import { SpeechBubble } from "./components/SpeechBubble";
import { CHARACTERS, getSavedCharId, saveCharId } from "./game/characters";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
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
    currentTheme,
    activeMilestone,
    activeThemeToast,
    dodgerMsg,
    startGame,
    showResult,
    engineRef,
  } = useGame(canvasRef);

  const [showRecords, setShowRecords] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showRankingViewOnly, setShowRankingViewOnly] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState(getSavedCharId());

  const selectedChar =
    CHARACTERS.find((c) => c.id === selectedCharId) ?? CHARACTERS[0];

  const handleSelectChar = (id: string) => {
    setSelectedCharId(id);
    saveCharId(id);
  };

  const handleStart = () => {
    startGame(selectedChar.src);
  };

  const handleRestart = () => {
    startGame(selectedChar.src);
  };

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
          isSlowMode={isSlowMode}
          slowTimeLeft={slowTimeLeft}
          currentTheme={currentTheme}
        />
      )}
      {isStarted && (
        <SpeechBubble
          message={dodgerMsg}
          engineRef={engineRef}
          canvasRef={canvasRef}
        />
      )}
      {isStarted && <MilestoneToast milestone={activeMilestone} />}
      {isStarted && <ThemeToast theme={activeThemeToast} />}
      {isStarted && (
        <PowerOverlay isPowerMode={isPowerMode} powerTimeLeft={powerTimeLeft} />
      )}

      {!isStarted && (
        <div className="overlay">
          <div className="start-card">
            <h1 className="game-title">함께Walk</h1>
            <p className="game-desc">
              발자국을 모으고 물병으로 에너지를 충전하며<br />6개의 테마 산책길을 달려보세요!
            </p>

            {/* 캐릭터 선택 */}
            <CharacterSelect
              selected={selectedCharId}
              onSelect={handleSelectChar}
            />

            <div className="hint-row">
              <span className="hint">🟡 발자국 수집 → +10점</span>
              <span className="hint">💧 물병 10개 → 파워워커 발동 (무적+2배)</span>
              <span className="hint">⏱️ 시계 → 6초간 속도 절반으로</span>
              <span className="hint">🪨 돌·동물·사람 → 피하세요!</span>
            </div>
            <button className="btn-primary" onClick={handleStart}>
              걷기 시작 🌿
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowCollection(true)}
            >
              🗺️ 산책 도감
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowRankingViewOnly(true)}
            >
              🌍 전체 랭킹 보기
            </button>
          </div>
        </div>
      )}

      {/* 게임 종료 오버레이 — 화면 보다가 탭하면 결과 팝업 */}
      {gameEnded && !gameOver && (
        <div
          onClick={showResult}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(2px)",
            zIndex: 30,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              padding: "28px 36px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🌿</div>
            <div
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              오늘도 잘 걸었어요!
            </div>
            <div
              style={{ fontSize: "0.85rem", opacity: 0.75, fontWeight: 500 }}
            >
              탭해서 결과 확인
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          distanceMeters={distanceMeters}
          onRestart={handleRestart}
          onShowRanking={() => setShowRanking(true)}
          onGoHome={() => { engineRef.current?.stop(); window.location.reload(); }}
        />
      )}

      {showCollection && (
        <ThemeCollectionModal onClose={() => setShowCollection(false)} />
      )}
      {showRecords && <RecordsModal onClose={() => setShowRecords(false)} />}
      {showRanking && (
        <RankingModal
          score={score}
          distanceMeters={distanceMeters}
          onClose={() => setShowRanking(false)}
        />
      )}
      {showRankingViewOnly && (
        <RankingModal
          viewOnly
          onClose={() => setShowRankingViewOnly(false)}
        />
      )}
    </div>
  );
}

export default App;
