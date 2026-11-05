'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/app/lib/theme-context';

export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a neutral placeholder until the client mounts to avoid a
  // hydration mismatch (server has no localStorage / window).
  if (!mounted) {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title="Toggle theme"
        className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="sr-only">Toggle theme</span>
        <Moon size={18} className="text-indigo-600" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === 'system' ? (
        <span className="sr-only">Use system theme</span>
      ) : theme === 'dark' ? (
        <span className="sr-only">Switch to light mode</span>
      ) : (
        <span className="sr-only">Switch to dark mode</span>
      )}
      {resolvedTheme === 'dark' ? (
        <Sun size={18} className="text-yellow-500" />
      ) : (
        <Moon size={18} className="text-indigo-600" />
      )}
    </button>
  );
}
