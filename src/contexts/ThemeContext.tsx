import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { defaultThemeSettings } from '../data/themes';
import { ThemeSettings } from '../types/theme';
import { applyTheme, clearTheme, readThemeSettings, resolveDark, systemPrefersDark, THEME_STORAGE_KEY } from '../utils/theme';

type ThemeContextValue = {
  settings: ThemeSettings;
  isDark: boolean;
  update: (patch: Partial<ThemeSettings>) => void;
  reset: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const [settings, setSettings] = useState<ThemeSettings>(readThemeSettings);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
    } catch {

      /* trình duyệt chặn lưu trữ: chỉ áp dụng trong phiên */}
  }, [settings]);

  const isDark = resolveDark(settings, systemDark);

  // Gắn lên <html> để cả popup/ngăn kéo (portal ra body) cũng đổi theo; rời ứng dụng (về đăng nhập) thì trả về mặc định.
  // Lần đầu đã được áp sẵn trong index.tsx trước khi vẽ → không nháy nền sáng.
  useLayoutEffect(() => {
    applyTheme(settings, isDark);
    return clearTheme;
  }, [settings, isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      settings,
      isDark,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings(defaultThemeSettings)
    }),
    [settings, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}