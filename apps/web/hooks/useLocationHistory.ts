const STORAGE_KEY = 'lastViewItem';

export function addToHistory(code: string) {
  localStorage.setItem(STORAGE_KEY, code);
}

export function getLastViewed(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
