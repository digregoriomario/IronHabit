export const formatMinutes = (value) => `${Math.round(Number(value || 0))} min`;

export const formatSeconds = (value) => {
  const seconds = Math.max(0, Math.round(Number(value || 0)));
  const mins = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${mins}:${String(rest).padStart(2, "0")}`;
};

export const formatProgress = (current, target) => {
  const ratio = Number(target || 0) > 0 ? Math.min(1, Number(current || 0) / Number(target)) : 0;
  return Math.round(ratio * 100);
};
