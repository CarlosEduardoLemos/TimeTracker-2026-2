import { useEffect, useState } from 'react';

const STORAGE_KEY = 'timetracker-theme';

function initialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved === 'dark';
  } catch {
    // A blocked storage must not prevent the interface from rendering.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
}

export function useTheme() {
  const [dark, setDark] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // The preference still applies for this session if persistence is unavailable.
    }
  }, [dark]);
  return [dark, () => setDark((value) => !value)];
}
