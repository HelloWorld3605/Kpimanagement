import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

/**
 * Cấu hình Firebase — lấy trong Firebase Console → Project settings → Your apps → Web app (</>) → SDK setup and configuration.
 * Để trống apiKey / projectId: ứng dụng chạy bằng dữ liệu mẫu trong trình duyệt như trước (mất khi tải lại).
 * Điền đủ: đăng nhập qua Firebase Auth, dữ liệu lưu ở Firestore và dùng chung giữa các máy.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyAe0Y2vdJii8M_zeV-2jjkavVw_PZa-dzw',
  authDomain: 'kpi-management-8b41a.firebaseapp.com',
  projectId: 'kpi-management-8b41a',
  storageBucket: 'kpi-management-8b41a.firebasestorage.app',
  messagingSenderId: '1070327893803',
  appId: '1:1070327893803:web:f4a196a14d50c314dc7f6e',
  measurementId: 'G-14CKDY5REZ'
};

/** Bộ sưu tập Firestore chứa dữ liệu ứng dụng — mỗi nhóm dữ liệu là một tài liệu */
export const FIRESTORE_COLLECTION = 'kpi-app';

// VITE_DISABLE_FIREBASE=1 khi chạy thử tại máy: dùng dữ liệu mẫu trong trình duyệt, không gọi Firebase
export const isFirebaseConfigured = !import.meta.env.VITE_DISABLE_FIREBASE && Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('[firebase] Không khởi tạo được Firebase, dùng dữ liệu mẫu.', err);
    app = null;
    auth = null;
    db = null;
  }
}

export { app as firebaseApp, auth as firebaseAuth, db as firestore };