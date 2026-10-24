import { hiddenNavItems, navEntries, NavGroup, NavItem } from '../data/navigation';

export type NavContext = {group?: NavGroup;item?: NavItem;sub?: string;};

export function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function subLabel(pathname: string, path: string) {
  if (pathname === path) return undefined;
  const seg = decodeURIComponent(pathname.slice(path.length + 1).split('/')[0]);
  return seg === 'tao-moi' ? 'Tạo mới' : seg.toUpperCase();
}

export function findNavContext(pathname: string): NavContext {
  for (const entry of navEntries) {
    if (entry.type === 'link') {
      if (isPathActive(pathname, entry.path)) return { item: entry, sub: subLabel(pathname, entry.path) };
      continue;
    }
    const item = entry.items.find((i) => isPathActive(pathname, i.path));
    if (item) return { group: entry, item, sub: subLabel(pathname, item.path) };
  }
  const hidden = hiddenNavItems.find((i) => isPathActive(pathname, i.path));
  if (hidden) return { item: hidden, sub: subLabel(pathname, hidden.path) };
  return {};
}