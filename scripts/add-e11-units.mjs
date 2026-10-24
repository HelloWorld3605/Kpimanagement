// Trung đoàn 11 trên Firestore: đổi tên đơn vị e-thudo thành "Trung đoàn 11" (E11) và thêm đơn vị trực thuộc:
// Ban Chỉ huy Trung đoàn, 4 ban (BTM, BCT, BHC, BHL) cấp tiểu đoàn, Đại đội 1 → 10 (c1 → c10).
// Đơn vị đã có cùng mã thì giữ nguyên, không ghi đè.
// Mặc định chỉ in kế hoạch (chạy thử); thêm --apply để ghi.
//
// Chạy: KPI_USERNAME=sieuquantri KPI_PASSWORD=... node scripts/add-e11-units.mjs [--apply]
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAe0Y2vdJii8M_zeV-2jjkavVw_PZa-dzw',
  authDomain: 'kpi-management-8b41a.firebaseapp.com',
  projectId: 'kpi-management-8b41a'
};
const REGIMENT = 'e-thudo';
const apply = process.argv.includes('--apply');

const children = [
{ id: 'e11-bch', name: 'Ban Chỉ huy Trung đoàn', shortName: 'BCH', level: 'tieu-doan', parentId: REGIMENT },
{ id: 'e11-btm', name: 'Ban Tham mưu', shortName: 'BTM', level: 'tieu-doan', parentId: REGIMENT },
{ id: 'e11-bct', name: 'Ban Chính trị', shortName: 'BCT', level: 'tieu-doan', parentId: REGIMENT },
{ id: 'e11-bhc', name: 'Ban Hậu cần', shortName: 'BHC', level: 'tieu-doan', parentId: REGIMENT },
{ id: 'e11-bhl', name: 'Ban Huấn luyện', shortName: 'BHL', level: 'tieu-doan', parentId: REGIMENT },
...Array.from({ length: 10 }, (_, i) => ({ id: `c${i + 1}`, name: `Đại đội ${i + 1}`, shortName: `c${i + 1}`, level: 'dai-doi', parentId: REGIMENT }))];

const { KPI_USERNAME: username, KPI_PASSWORD: password } = process.env;
if (!username || !password) {
  console.error('Thiếu KPI_USERNAME / KPI_PASSWORD.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
await signInWithEmailAndPassword(getAuth(app), `${username}@kpi.bca.vn`, password);
const db = getFirestore(app);

const snap = await getDocs(collection(db, 'units'));
const existing = new Map(snap.docs.map((d) => [d.id, { ...JSON.parse(d.data().json), order: d.data().order ?? 0 }]));
const regiment = existing.get(REGIMENT);
if (!regiment) throw new Error(`Không thấy đơn vị "${REGIMENT}" trên Firestore — dừng.`);

const toAdd = children.filter((u) => !existing.has(u.id));
const skipped = children.filter((u) => existing.has(u.id));
let order = Math.max(0, ...[...existing.values()].map((u) => u.order)) + 1;

console.log(`Đổi tên ${REGIMENT}: "${regiment.name}" → "Trung đoàn 11" (E11)`);
console.log(`Thêm ${toAdd.length} đơn vị: ${toAdd.map((u) => `${u.id} ${u.name}`).join('; ') || '—'}`);
if (skipped.length) console.log(`Bỏ qua (đã có): ${skipped.map((u) => u.id).join(', ')}`);

if (!apply) {
  console.log('\nChạy thử — chưa ghi gì. Thêm --apply để thực hiện.');
  process.exit(0);
}

const batch = writeBatch(db);
const { order: _order, ...regimentData } = regiment;
batch.set(
  doc(db, 'units', REGIMENT),
  { json: JSON.stringify({ ...regimentData, name: 'Trung đoàn 11', shortName: 'E11' }), updatedAt: serverTimestamp() },
  { merge: true }
);
toAdd.forEach((u) => batch.set(doc(db, 'units', u.id), { json: JSON.stringify(u), order: order++, updatedAt: serverTimestamp() }));
await batch.commit();

console.log('\nĐã ghi xong.');
process.exit(0);
