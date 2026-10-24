import { defaultThemeSettings, densityOptions, palettes, radiusOptions } from '../data/themes';
import { BrandShade, ThemeSettings } from '../types/theme';

type Rgb = [number, number, number];

const SHADES: BrandShade[] = [50, 100, 200, 500, 600, 700, 800, 900];
/** Nền khối ở chế độ tối (phải khớp --surface trong index.css) */
const DARK_SURFACE: Rgb = [33, 30, 26];
const WHITE: Rgb = [255, 255, 255];

/** Mức pha cho chế độ tối: tông nhạt (50–200) pha từ nền tối, tông đậm (500–900) pha sáng lên để đọc được trên nền tối */
const DARK_MIX: Record<BrandShade, {from: 'surface' | 'base';t: number;}> = {
  50: { from: 'surface', t: 0.16 },
  100: { from: 'surface', t: 0.26 },
  200: { from: 'surface', t: 0.42 },
  500: { from: 'base', t: 0.12 },
  600: { from: 'base', t: 0.22 },
  700: { from: 'base', t: 0.34 },
  800: { from: 'base', t: 0.48 },
  900: { from: 'base', t: 0.62 }
};

export const THEME_VAR_NAMES = [...SHADES.map((s) => `--brand-${s}`), '--sidebar', '--radius', '--ui-density'];

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace('#', ''), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as Rgb;
}

const triplet = (c: Rgb) => c.join(' ');

export function findPalette(id: string) {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}

/** Biến CSS cho tông màu, thanh bên, bo góc và mật độ — gắn lên thẻ <html> */
export function buildThemeVars(s: ThemeSettings, isDark: boolean): Record<string, string> {
  const shades = findPalette(s.palette).shades;
  const base = hexToRgb(shades[500]);
  const vars: Record<string, string> = {};
  SHADES.forEach((shade) => {
    if (!isDark) {
      vars[`--brand-${shade}`] = triplet(hexToRgb(shades[shade]));
      return;
    }
    const m = DARK_MIX[shade];
    vars[`--brand-${shade}`] = triplet(m.from === 'surface' ? mix(DARK_SURFACE, base, m.t) : mix(base, WHITE, m.t));
  });
  vars['--sidebar'] = triplet(hexToRgb(isDark ? shades[900] : shades[800]));
  vars['--radius'] = `${(radiusOptions.find((r) => r.id === s.radius) ?? radiusOptions[2]).px}px`;
  vars['--ui-density'] = String((densityOptions.find((d) => d.id === s.density) ?? densityOptions[1]).percent / 100);
  return vars;
}

export const THEME_STORAGE_KEY = 'kpi-ui-theme';

export function readThemeSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? { ...defaultThemeSettings, ...(JSON.parse(raw) as Partial<ThemeSettings>) } : defaultThemeSettings;
  } catch {
    return defaultThemeSettings;
  }
}

export const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const resolveDark = (s: ThemeSettings, systemDark: boolean) => s.mode === 'dark' || s.mode === 'system' && systemDark;

/** Gắn lớp tối + biến màu lên <html> */
export function applyTheme(s: ThemeSettings, isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('theme-dark', isDark);
  Object.entries(buildThemeVars(s, isDark)).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function clearTheme() {
  const root = document.documentElement;
  root.classList.remove('theme-dark');
  THEME_VAR_NAMES.forEach((k) => root.style.removeProperty(k));
}