interface Props {
  isPowerMode: boolean;
  powerTimeLeft: number;
}

export function PowerOverlay({ isPowerMode, powerTimeLeft }: Props) {
  if (!isPowerMode) return null;

  const isWarning = powerTimeLeft <= 3;
  const seconds = Math.ceil(powerTimeLeft);

  return (
    <>
      {/* 화면 테두리 글로우 (전 구간) */}
      <div className={`power-vignette${isWarning ? ' is-warning' : ''}`} />

      {/* 3초 이하: 전체 배경 워닝 + 카운트다운 */}
      {isWarning && (
        <>
          <div className="power-warning-bg" />
          <div className="power-warning-text">
            ⚡ {seconds}초 후 종료돼요! 대비하세요
          </div>
        </>
      )}
    </>
  );
}
