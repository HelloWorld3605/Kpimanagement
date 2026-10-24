export type PaletteId = 'kpi' | 'navy' | 'blue' | 'indigo' | 'violet' | 'emerald' | 'teal' | 'rose' | 'orange' | 'amber' | 'slate';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SidebarStyle = 'dark' | 'surface';
export type UiDensity = 'compact' | 'cozy' | 'roomy';
export type RadiusId = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type BrandShade = 50 | 100 | 200 | 500 | 600 | 700 | 800 | 900;

export type Palette = {
  id: PaletteId;
  label: string;
  shades: Record<BrandShade, string>;
};

export type ThemeSettings = {
  palette: PaletteId;
  mode: ThemeMode;
  sidebar: SidebarStyle;
  density: UiDensity;
  radius: RadiusId;
};