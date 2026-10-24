import React from 'react';
import { CheckIcon, MonitorIcon, MoonIcon, RotateCcwIcon, SunIcon } from 'lucide-react';
import { SideDrawer } from './ui/SideDrawer';
import { useTheme } from '../contexts/ThemeContext';
import { densityOptions, palettes, radiusOptions } from '../data/themes';
import { ThemeMode, SidebarStyle } from '../types/theme';

type ThemeCustomizerProps = {
  open: boolean;
  onClose: () => void;
};

const modes: {id: ThemeMode;label: string;icon: typeof SunIcon;}[] = [
{ id: 'light', label: 'Sáng', icon: SunIcon },
{ id: 'dark', label: 'Tối', icon: MoonIcon },
{ id: 'system', label: 'Theo hệ thống', icon: MonitorIcon }];


const sidebars: {id: SidebarStyle;label: string;}[] = [
{ id: 'dark', label: 'Thanh bên tối' },
{ id: 'surface', label: 'Cùng màu nền' }];


export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { settings, update, reset } = useTheme();
  const active = palettes.find((p) => p.id === settings.palette) ?? palettes[0];

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      labelledBy="theme-customizer-title"
      widthClassName="max-w-[400px]"
      header={
      <>
          <h2 id="theme-customizer-title" className="text-[15px] font-semibold text-gray-900">
            Tùy chỉnh giao diện
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-500">Chọn tông màu cho giao diện. Lựa chọn được lưu trên trình duyệt này.</p>
        </>
      }
      footer={
      <button
        type="button"
        onClick={reset}
        className="flex h-9 w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white text-[14px] font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ transition: 'background-color 150ms ease-out' }}>
        
          <RotateCcwIcon className="h-4 w-4" aria-hidden />
          Khôi phục mặc định
        </button>
      }>
      
      <div className="space-y-6 px-5 py-5">
        <Group title="Màu chủ đạo">
          <div className="grid grid-cols-2 gap-2">
            {palettes.map((p) => {
              const on = p.id === settings.palette;
              return (
                <Option key={p.id} selected={on} onClick={() => update({ palette: p.id })} className="justify-start px-3">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: p.shades[600] }} aria-hidden />
                  <span className="flex-1 truncate text-left">{p.label}</span>
                  {on && <CheckIcon className="h-4 w-4 shrink-0" aria-hidden />}
                </Option>);

            })}
          </div>
        </Group>

        <Group title="Chế độ hiển thị">
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) =>
            <Option key={m.id} selected={settings.mode === m.id} onClick={() => update({ mode: m.id })}>
                <m.icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{m.label}</span>
              </Option>
            )}
          </div>
        </Group>

        <Group title="Thanh bên">
          <div className="grid grid-cols-2 gap-2">
            {sidebars.map((s) =>
            <Option key={s.id} selected={settings.sidebar === s.id} onClick={() => update({ sidebar: s.id })}>
                <span
                className={`h-3.5 w-3.5 shrink-0 rounded-sm ${s.id === 'surface' ? 'border border-gray-300 bg-white' : ''}`}
                style={s.id === 'dark' ? { backgroundColor: active.shades[800] } : undefined}
                aria-hidden />
              
                <span className="truncate">{s.label}</span>
              </Option>
            )}
          </div>
        </Group>

        <Group title="Mật độ">
          <div className="grid grid-cols-3 gap-2">
            {densityOptions.map((d) =>
            <Option key={d.id} selected={settings.density === d.id} onClick={() => update({ density: d.id })} className="h-auto flex-col gap-0 py-2">
                <span>{d.label}</span>
                <span className="text-[11px] font-normal opacity-70">{d.percent}%</span>
              </Option>
            )}
          </div>
        </Group>

        <Group title="Bo góc">
          <div className="grid grid-cols-5 gap-2">
            {radiusOptions.map((r) =>
            <Option key={r.id} selected={settings.radius === r.id} onClick={() => update({ radius: r.id })} style={{ borderRadius: r.px }}>
                {r.label}
              </Option>
            )}
          </div>
        </Group>
      </div>
    </SideDrawer>);

}

function Group({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-gray-500">{title}</legend>
      {children}
    </fieldset>);

}

type OptionProps = {
  selected: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

function Option({ selected, onClick, className = '', style, children }: OptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{ transition: 'background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out', ...style }}
      className={`flex h-9 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded border px-2 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
      selected ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'} ${
      className}`}>
      
      {children}
    </button>);

}