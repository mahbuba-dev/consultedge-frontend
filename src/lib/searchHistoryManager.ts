const STORAGE_KEY = "consultedge:search-history:v1";
const MAX_HISTORY = 8;

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function normalize(value: string): string {
  return value.trim();
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const query = normalize(value);
    if (!query) continue;
    const key = query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(query);
    if (output.length >= MAX_HISTORY) break;
  }

  return output;
}

function dispatchUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("consultedge:search-history-updated"));
}

export function readSearchHistory(): string[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return dedupe(parsed.map((item) => (typeof item === "string" ? item : "")));
  } catch {
    return [];
  }
}

export function writeSearchHistory(values: string[]) {
  if (!isBrowser()) return;

  try {
    const normalized = dedupe(values);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    dispatchUpdate();
  } catch {
    // Ignore storage failures.
  }
}

export function addSearchHistory(query: string) {
  const normalized = normalize(query);
  if (!normalized) return;

  const current = readSearchHistory();
  writeSearchHistory([normalized, ...current]);
}

export function clearSearchHistory() {
  writeSearchHistory([]);
}

export function syncSearchHistoryFromBackend(values: string[]) {
  if (!Array.isArray(values)) return;

  const local = readSearchHistory();
  writeSearchHistory([...values, ...local]);
}
