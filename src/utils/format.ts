export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatMinutesSeconds = (seconds: number): string =>
  `${Math.floor(seconds / 60)} phút ${seconds % 60} giây`;
