import { Palette, RadiusId, ThemeSettings, UiDensity } from '../types/theme';

export const palettes: Palette[] = [
{ id: 'kpi', label: 'KPI', shades: { 50: '#FBF2F1', 100: '#F7E3E1', 200: '#EDC3BF', 500: '#B3171D', 600: '#9A1419', 700: '#7E1015', 800: '#661218', 900: '#4C0C10' } },
{ id: 'navy', label: 'Navy', shades: { 50: '#EEF2F8', 100: '#DCE4F0', 200: '#B7C6DE', 500: '#24467F', 600: '#1C3A6B', 700: '#162E56', 800: '#112443', 900: '#0B1A31' } },
{ id: 'blue', label: 'Blue', shades: { 50: '#EFF5FF', 100: '#DBE8FE', 200: '#BCD4FC', 500: '#1D64D8', 600: '#1A56BC', 700: '#16469A', 800: '#13397C', 900: '#0F2C5E' } },
{ id: 'indigo', label: 'Indigo', shades: { 50: '#F0F1FD', 100: '#E0E3FB', 200: '#C3C8F6', 500: '#4F46C8', 600: '#4339AE', 700: '#37308E', 800: '#2C2772', 900: '#211D55' } },
{ id: 'violet', label: 'Violet', shades: { 50: '#F6F1FD', 100: '#ECE2FB', 200: '#D8C5F6', 500: '#7C3AC7', 600: '#6B2FAD', 700: '#58278D', 800: '#461F70', 900: '#341753' } },
{ id: 'emerald', label: 'Emerald', shades: { 50: '#EEF8F2', 100: '#D9F0E2', 200: '#B0DDC2', 500: '#0E7A47', 600: '#0C6A3E', 700: '#0A5733', 800: '#084529', 900: '#06331E' } },
{ id: 'teal', label: 'Teal', shades: { 50: '#EDF8F8', 100: '#D6EFEF', 200: '#A9DCDC', 500: '#0F7C7C', 600: '#0D6B6B', 700: '#0B5858', 800: '#084646', 900: '#063434' } },
{ id: 'rose', label: 'Rose', shades: { 50: '#FDF1F4', 100: '#FBE1E8', 200: '#F5BFCE', 500: '#C8174F', 600: '#AE1445', 700: '#8F1139', 800: '#720D2E', 900: '#550A22' } },
{ id: 'orange', label: 'Orange', shades: { 50: '#FEF4EE', 100: '#FDE5D6', 200: '#FAC9AA', 500: '#C2490C', 600: '#A83F0A', 700: '#8A3408', 800: '#6E2907', 900: '#521F05' } },
{ id: 'amber', label: 'Amber', shades: { 50: '#FCF7EA', 100: '#F8EDCC', 200: '#F0D896', 500: '#A87A07', 600: '#926A06', 700: '#785705', 800: '#604504', 900: '#483403' } },
{ id: 'slate', label: 'Slate', shades: { 50: '#F3F4F6', 100: '#E5E7EB', 200: '#CBD0D8', 500: '#374151', 600: '#2F3846', 700: '#262E3A', 800: '#1E242E', 900: '#161B22' } }];


export const densityOptions: {id: UiDensity;label: string;percent: number;}[] = [
{ id: 'compact', label: 'Thu gọn', percent: 85 },
{ id: 'cozy', label: 'Tiêu chuẩn', percent: 100 },
{ id: 'roomy', label: 'Thoáng', percent: 115 }];


export const radiusOptions: {id: RadiusId;label: string;px: number;}[] = [
{ id: 'none', label: '0', px: 0 },
{ id: 'sm', label: 'sm', px: 1 },
{ id: 'md', label: 'md', px: 2 },
{ id: 'lg', label: 'lg', px: 6 },
{ id: 'xl', label: 'xl', px: 10 }];


export const defaultThemeSettings: ThemeSettings = {
  palette: 'kpi',
  mode: 'light',
  sidebar: 'dark',
  density: 'cozy',
  radius: 'md'
};