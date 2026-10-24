/**
 * Mép trên của vùng dính trong khung cuộn chính = thanh trên cùng + hàng tab của màn (nếu có).
 * AppShell đo và ghi vào biến CSS --sticky-top trên khung cuộn; mọi phần dính (tiêu đề cột, cột cây,
 * nhãn ngày…) đọc cùng một giá trị để nằm ngay dưới hàng tab thay vì bị tab che.
 */
export const TOPBAR_HEIGHT = 44;
export const STICKY_TOP_EVENT = 'app:sticky-top';

export function readStickyTop(scroller: Element | null | undefined) {
  if (!scroller) return TOPBAR_HEIGHT;
  const v = parseFloat(getComputedStyle(scroller).getPropertyValue('--sticky-top'));
  return Number.isFinite(v) && v > 0 ? v : TOPBAR_HEIGHT;
}