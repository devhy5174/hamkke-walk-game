interface Props {
  isPowerMode: boolean;
  powerTimeLeft: number;
  isMoonlight?: boolean;
}

export function PowerOverlay({ isPowerMode, powerTimeLeft, isMoonlight }: Props) {
  if (!isPowerMode) return null;

  const isWarning = powerTimeLeft <= 3;
  const seconds = Math.ceil(powerTimeLeft);

  if (isMoonlight) return null;

  return (
    <>
      <div className={`power-vignette${isWarning ? ' is-warning' : ''}`} />
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
