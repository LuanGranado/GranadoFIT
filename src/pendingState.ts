import type { AppData } from "./model";

type PendingState = { revision: string; data: AppData };
const keyFor = (userId: string) => `granadofit-pending-${userId}`;

export function readPendingState(userId: string): PendingState | null {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingState;
    if (!parsed?.revision || !parsed.data?.profile || !parsed.data?.workouts)
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingState(userId: string, data: AppData): string {
  const revision = crypto.randomUUID();
  localStorage.setItem(keyFor(userId), JSON.stringify({ revision, data }));
  return revision;
}

export function clearPendingState(userId: string, revision: string): void {
  if (readPendingState(userId)?.revision === revision)
    localStorage.removeItem(keyFor(userId));
}
