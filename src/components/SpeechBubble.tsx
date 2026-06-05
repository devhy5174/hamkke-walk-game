interface Props {
  message: string | null;
}

export function SpeechBubble({ message }: Props) {
  if (!message) return null;
  return (
    <div className="speech-bubble">
      <div className="speech-bubble-inner">{message}</div>
    </div>
  );
}
