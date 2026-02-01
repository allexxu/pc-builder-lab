/**
 * Generează un PIN de 6 cifre pentru jocuri
 * Nu începe cu 0 pentru a evita confuzii
 */
export function generateGamePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Calculează punctajul bazat pe corectitudine și viteză
 * @param isCorrect - dacă răspunsul este corect
 * @param responseTimeMs - timpul de răspuns în milisecunde
 * @param timeLimitMs - limita de timp în milisecunde
 * @returns punctele câștigate
 */
export function calculatePoints(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitMs: number
): number {
  if (!isCorrect) return 0;

  const basePoints = 100;
  const speedRatio = 1 - responseTimeMs / timeLimitMs;
  const speedBonus = Math.floor(100 * Math.max(0, speedRatio));

  return basePoints + speedBonus;
}

/**
 * Formatează timpul rămas pentru afișare
 */
export function formatTime(seconds: number): string {
  return String(Math.max(0, Math.floor(seconds)));
}

/**
 * Culorile pentru butoanele de răspuns (stil Kahoot)
 */
export const ANSWER_COLORS = [
  { bg: "bg-red-500", hover: "hover:bg-red-600", text: "text-white" },
  { bg: "bg-blue-500", hover: "hover:bg-blue-600", text: "text-white" },
  { bg: "bg-yellow-500", hover: "hover:bg-yellow-600", text: "text-black" },
  { bg: "bg-green-500", hover: "hover:bg-green-600", text: "text-white" },
] as const;

/**
 * Iconițele pentru răspunsuri
 */
export const ANSWER_ICONS = ["▲", "◆", "●", "■"] as const;

/**
 * Validează PIN-ul (6 cifre)
 */
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/**
 * Validează nickname-ul (2-20 caractere)
 */
export function isValidNickname(nickname: string): boolean {
  const trimmed = nickname.trim();
  return trimmed.length >= 2 && trimmed.length <= 20;
}
