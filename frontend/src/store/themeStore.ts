import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'system',
            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },
        }),
        { name: 'learnhub-theme' }
    )
);

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
}

// Initialize theme on load
export function initializeTheme() {
    const stored = localStorage.getItem('learnhub-theme');
    const parsed = stored ? JSON.parse(stored) : { state: { theme: 'system' } };
    applyTheme(parsed.state?.theme || 'system');

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentTheme = useThemeStore.getState().theme;
        if (currentTheme === 'system') applyTheme('system');
    });
}