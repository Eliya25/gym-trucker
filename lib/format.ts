// "47 דק'" below an hour, "1:12 שע'" from an hour up.
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} דק'`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, "0")} שע'`;
}

export function durationMinutes(startedAt: string, completedAt: string) {
  return Math.max(
    1,
    Math.round(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000
    )
  );
}
