import { abcFromTasks, fmtScore, kpiIndex, taskPart, totalScore, validateAllocation } from './kpi';

/** 4 ca kiểm thử bắt buộc của bộ tính điểm — chạy một lần khi ứng dụng khởi động */
export const kpiChecks: {name: string;run: () => boolean;}[] = [
{
  name: 'KPI_CN 64,333; E 27 → phần nhiệm vụ 45,0331 → tổng G hiển thị 72,03',
  run: () => taskPart(64.333) === 45.0331 && fmtScore(totalScore(27, 64.333)) === fmtScore(72.03)
},
{
  name: 'Lãnh đạo: A 0,9 · B 0,8 · C 1,0 · D 0,75 → KPI_LĐ 86,25',
  run: () => kpiIndex({ a: 0.9, b: 0.8, c: 1, d: 0.75 }) === 86.25
},
{
  name: 'Cùng số lượng, khác điểm cơ sở → đóng góp khác nhau vào A',
  run: () => {
    const base = (doneA: number, doneB: number) =>
    abcFromTasks([
    { baseScore: 10, assignedQty: 2, doneQty: doneA, qualityPct: 100, schedulePct: 100 },
    { baseScore: 50, assignedQty: 2, doneQty: doneB, qualityPct: 100, schedulePct: 100 }]
    ).a;
    return base(2, 1) !== base(1, 2);
  }
},
{
  name: 'Bảng phân bổ tổng 69 hoặc 71 → báo lỗi; đúng 70 → hợp lệ',
  run: () => !validateAllocation([35, 34]).ok && !validateAllocation([35, 36]).ok && validateAllocation([35, 35]).ok
}];


export function runKpiChecks() {
  const failed = kpiChecks.filter((c) => {
    try {
      return !c.run();
    } catch {
      return true;
    }
  });
  failed.forEach((c) => console.error(`[KPI] Ca kiểm thử không đạt: ${c.name}`));
  return { passed: kpiChecks.length - failed.length, total: kpiChecks.length, failed: failed.map((c) => c.name) };
}