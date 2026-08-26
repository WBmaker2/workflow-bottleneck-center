export interface LiveStatusProps {
  message: string;
  blocked?: boolean;
}

export function LiveStatus({ message, blocked = false }: LiveStatusProps) {
  if (!message) return null;
  return blocked ? (
    <p className="live-status live-status--blocked" role="alert" aria-live="assertive">
      {message}
    </p>
  ) : (
    <p className="live-status" role="status" aria-live="polite">
      {message}
    </p>
  );
}
