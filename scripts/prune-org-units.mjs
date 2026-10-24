// Thu gọn cơ cấu tổ chức trên Firestore: chỉ giữ Bộ Tư lệnh (btl) và Trung đoàn CSCĐ Thủ đô (e-thudo).
// - Cán bộ thuộc nhánh Trung đoàn → chuyển về e-thudo; cán bộ các phòng, đội khác → chuyển về btl.
// - Tài khoản được phân công đơn vị đã xoá → đổi sang đơn vị nhận cán bộ tương ứng.
// - Mặc định chỉ in kế hoạch (chạy thử); thêm --apply để ghi.
//
// Chạy: KPI_USERNAME=sieuquantri KPI_PASSWORD=... node scripts/prune-org-units.mjs [--apply]
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAe0Y2vdJii8M_zeV-2jjkavVw_PZa-dzw',
  authDomain: 'kpi-management-8b41a.firebaseapp.com',
  projectId: 'kpi-management-8b41a'
};
const KEEP = ['btl', 'e-thudo'];
const REGIMENT = 'e-thudo';
const ROOT = 'btl';
const apply = process.argv.includes('--apply');

const { KPI_USERNAME: username, KPI_PASSWORD: password } = process.env;
if (!username || !password) {
  console.error('Thiếu KPI_USERNAME / KPI_PASSWORD.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
await signInWithEmailAndPassword(getAuth(app), `${username}@kpi.bca.vn`, password);
const db = getFirestore(app);

const read = async (name) =>
(await getDocs(collection(db, name))).docs.map((d) => ({ id: d.id, data: JSON.parse(d.data().json) }));

const units = await read('units');
const byId = new Map(units.map((u) => [u.id, u.data]));
for (const id of KEEP) if (!byId.has(id)) throw new Error(`Không thấy đơn vị "${id}" trên Firestore — dừng.`);

/** Đơn vị nhận cán bộ của một đơn vị bị xoá: thuộc nhánh Trung đoàn → Trung đoàn, còn lại → Bộ Tư lệnh */
function targetOf(unitId) {
  for (let id = unitId, guard = 0; id && guard < 50; id = byId.get(id)?.parentId, guard++) {
    if (id === REGIMENT) return REGIMENT;
  }
  return ROOT;
}

const removed = units.filter((u) => !KEEP.includes(u.id));
const removedIds = new Set(removed.map((u) => u.id));

const members = (await read('members')).filter((m) => removedIds.has(m.data.unitId));
const accounts = (await read('accounts')).filter((a) => (a.data.assignedUnitIds ?? []).some((id) => removedIds.has(id)));

console.log(`Giữ: ${KEEP.join(', ')}`);
console.log(`Xoá ${removed.length} đơn vị: ${removed.map((u) => `${u.id} (${u.data.name})`).join('; ')}`);
console.log(`Chuyển ${members.length} cán bộ:`);
members.forEach((m) => console.log(`  ${m.id} ${m.data.name}: ${m.data.unitId} → ${targetOf(m.data.unitId)}`));
console.log(`Sửa phân công ${accounts.length} tài khoản: ${accounts.map((a) => a.id).join(', ') || '—'}`);

if (!apply) {
  console.log('\nChạy thử — chưa ghi gì. Thêm --apply để thực hiện.');
  process.exit(0);
}

// Firestore: tối đa 500 thao tác / batch
let batch = writeBatch(db);
let ops = 0;
const queue = async (fn) => {
  fn(batch);
  if (++ops >= 450) {
    await batch.commit();
    batch = writeBatch(db);
    ops = 0;
  }
};

// Chuyển cán bộ và tài khoản trước, xoá đơn vị sau — không để cán bộ trỏ vào đơn vị không còn
for (const m of members) {
  const next = { ...m.data, unitId: targetOf(m.data.unitId) };
  await queue((b) => b.set(doc(db, 'members', m.id), { json: JSON.stringify(next), updatedAt: serverTimestamp() }, { merge: true }));
}
for (const a of accounts) {
  const ids = [...new Set(a.data.assignedUnitIds.map((id) => removedIds.has(id) ? targetOf(id) : id))];
  const next = { ...a.data, assignedUnitIds: ids };
  await queue((b) => b.set(doc(db, 'accounts', a.id), { json: JSON.stringify(next), updatedAt: serverTimestamp() }, { merge: true }));
}
for (const u of removed) await queue((b) => b.delete(doc(db, 'units', u.id)));
if (ops) await batch.commit();

console.log('\nĐã ghi xong.');
process.exit(0);
