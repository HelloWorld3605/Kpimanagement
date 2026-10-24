import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '../utils/firebase';
import { useFirebaseUser } from './useFirebaseUser';

/** Tài liệu đánh dấu bộ sưu tập đã được nạp dữ liệu khởi đầu (để xoá hết không bị nạp lại) */
const META_COLLECTION = 'kpi-meta';
/** Firestore giới hạn 500 thao tác / batch */
const BATCH_LIMIT = 450;

type Synced = Map<string, {json: string;order: number;}>;

/**
 * useState cho một danh sách, mỗi phần tử là MỘT bản ghi Firestore `{name}/{id}`.
 * - Chưa cấu hình Firebase hoặc chưa đăng nhập: y hệt useState với dữ liệu khởi đầu.
 * - Đã đăng nhập: theo dõi cả bộ sưu tập (sắp theo `order`); mỗi thay đổi tại máy này chỉ ghi
 *   những bản ghi thêm / sửa / đổi vị trí và xoá bản ghi bị bỏ — gộp 300ms, chia batch.
 * - Lần đầu (bộ sưu tập trống, chưa đánh dấu): đưa dữ liệu khởi đầu lên rồi đánh dấu `kpi-meta/{name}`.
 * Nội dung lưu dạng chuỗi JSON (`json`) để không vướng giới hạn kiểu của Firestore.
 */
export function useSyncedCollection<T>(
name: string,
idOf: (item: T) => string,
initial: T[] | (() => T[]))
: [T[], Dispatch<SetStateAction<T[]>>] {
  const [items, setItems] = useState<T[]>(initial);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const idRef = useRef(idOf);
  idRef.current = idOf;
  /** Trạng thái lần cuối khớp với Firestore */
  const synced = useRef<Synced | null>(null);
  const [ready, setReady] = useState(false);
  const { user } = useFirebaseUser();
  const uid = user?.uid;

  // Theo dõi bộ sưu tập
  useEffect(() => {
    if (!firestore || !uid) {
      synced.current = null;
      setReady(false);
      return;
    }
    const db = firestore;
    let seeding = false;
    const q = query(collection(db, name), orderBy('order'));
    return onSnapshot(
      q,
      async (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        if (snap.empty && !seeding) {
          const meta = await getDoc(doc(db, META_COLLECTION, name)).catch(() => null);
          if (!meta?.exists()) {
            // Lần đầu: nạp dữ liệu khởi đầu (đang có tại chỗ) lên Firestore
            seeding = true;
            synced.current = new Map();
            setReady(true);
            await setDoc(doc(db, META_COLLECTION, name), { seededAt: serverTimestamp(), count: itemsRef.current.length }).catch((err) =>
            console.error(`[firestore] Không đánh dấu được "${name}"`, err)
            );
            return; // hiệu ứng ghi bên dưới sẽ đưa toàn bộ lên vì synced đang rỗng
          }
        }
        const next: Synced = new Map();
        const list: T[] = [];
        snap.docs.forEach((d) => {
          const data = d.data() as {json?: string;order?: number;};
          if (typeof data.json !== 'string') return;
          try {
            list.push(JSON.parse(data.json) as T);
            next.set(d.id, { json: data.json, order: data.order ?? 0 });
          } catch (err) {
            console.error(`[firestore] Bản ghi "${name}/${d.id}" hỏng, bỏ qua`, err);
          }
        });
        synced.current = next;
        setItems(list);
        setReady(true);
      },
      (err) => console.error(`[firestore] Không đọc được "${name}" — kiểm tra Security Rules`, err)
    );
  }, [name, uid]);

  // Ghi phần chênh lệch lên Firestore
  useEffect(() => {
    if (!firestore || !uid || !ready || !synced.current) return;
    const db = firestore;
    const timer = setTimeout(() => {
      const prev = synced.current ?? new Map();
      const next: Synced = new Map();
      const ops: {type: 'set' | 'delete';id: string;json?: string;order?: number;}[] = [];
      items.forEach((item, order) => {
        const raw = idRef.current(item);
        if (!raw) return;
        const id = safeId(raw);
        if (next.has(id)) return;
        const json = JSON.stringify(item);
        next.set(id, { json, order });
        const old = prev.get(id);
        if (!old || old.json !== json || old.order !== order) ops.push({ type: 'set', id, json, order });
      });
      prev.forEach((_, id) => {
        if (!next.has(id)) ops.push({ type: 'delete', id });
      });
      if (!ops.length) return;
      synced.current = next;
      const commits: Promise<void>[] = [];
      for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        ops.slice(i, i + BATCH_LIMIT).forEach((op) => {
          const ref = doc(db, name, op.id);
          if (op.type === 'delete') batch.delete(ref);else
          batch.set(ref, { json: op.json, order: op.order, updatedAt: serverTimestamp() });
        });
        commits.push(batch.commit());
      }
      Promise.all(commits).catch((err) => console.error(`[firestore] Không lưu được "${name}"`, err));
    }, 300);
    return () => clearTimeout(timer);
  }, [name, items, ready, uid]);

  return [items, setItems];
}

/** Mã tài liệu Firestore không được chứa "/" */
function safeId(id: string) {
  return id.replace(/\//g, '_');
}