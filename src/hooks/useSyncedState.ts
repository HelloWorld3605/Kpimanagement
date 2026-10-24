import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { FIRESTORE_COLLECTION, firestore } from '../utils/firebase';
import { useFirebaseUser } from './useFirebaseUser';

/**
 * useState có đồng bộ Firestore.
 * - Chưa cấu hình Firebase: y hệt useState (dữ liệu mẫu, mất khi tải lại).
 * - Đã cấu hình và đã đăng nhập: đọc + theo dõi tài liệu `kpi-app/{key}`; mọi thay đổi ghi lên (gộp 300ms)
 *   và hiện ngay trên các máy khác. Tài liệu chưa có thì tạo từ dữ liệu mẫu.
 * - Chưa đăng nhập: dùng dữ liệu mẫu tại chỗ (Security Rules chỉ cho người đã đăng nhập đọc / ghi).
 * Giá trị lưu dạng chuỗi JSON để không vướng giới hạn của Firestore (mảng lồng mảng, undefined).
 */
export function useSyncedState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const valueRef = useRef(value);
  valueRef.current = value;
  /** Chuỗi JSON lần cuối khớp với Firestore — tránh ghi lại chính thứ vừa nhận về */
  const syncedJson = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const { user } = useFirebaseUser();
  const uid = user?.uid;

  // Theo dõi tài liệu trên Firestore khi đã đăng nhập
  useEffect(() => {
    if (!firestore || !uid) {
      setReady(false);
      return;
    }
    const ref = doc(firestore, FIRESTORE_COLLECTION, key);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        if (!snap.exists()) {
          // Lần đầu: đưa dữ liệu mẫu lên
          const json = JSON.stringify(valueRef.current);
          syncedJson.current = json;
          setDoc(ref, { json, updatedAt: serverTimestamp() }).catch((err) => console.error(`[firestore] Không tạo được "${key}"`, err));
          setReady(true);
          return;
        }
        const json = (snap.data() as {json?: string;}).json;
        if (typeof json === 'string' && json !== syncedJson.current) {
          syncedJson.current = json;
          try {
            setValue(JSON.parse(json) as T);
          } catch (err) {
            console.error(`[firestore] Dữ liệu "${key}" hỏng, giữ bản hiện tại`, err);
          }
        }
        setReady(true);
      },
      (err) => console.error(`[firestore] Không đọc được "${key}" — kiểm tra Security Rules`, err)
    );
  }, [key, uid]);

  // Ghi thay đổi tại máy này lên Firestore
  useEffect(() => {
    if (!firestore || !uid || !ready) return;
    const json = JSON.stringify(value);
    if (json === syncedJson.current) return;
    const timer = setTimeout(() => {
      syncedJson.current = json;
      setDoc(doc(firestore!, FIRESTORE_COLLECTION, key), { json, updatedAt: serverTimestamp() }).catch((err) =>
      console.error(`[firestore] Không lưu được "${key}"`, err)
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [key, value, ready, uid]);

  return [value, setValue];
}