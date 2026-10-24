/** Mép giấy xé cho tấm form đăng nhập — seed cố định nên mép giống nhau mỗi lần mở */
export function buildTornEdgeClipPath(points = 90, startX = 72, endX = 90) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const edge: string[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const y = t * 100;
    const base = startX + (endX - startX) * Math.pow(t, 1.15);
    const wave = Math.sin(t * Math.PI * 5) * 1.6;
    const jitter = (rand() - 0.5) * (i % 3 === 0 ? 4 : 1.8);
    edge.push(`${Math.min(99.5, base + wave + jitter).toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(0% 0%, ${edge.join(', ')}, 0% 100%)`;
}