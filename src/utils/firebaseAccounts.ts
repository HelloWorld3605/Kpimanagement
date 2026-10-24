import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword } from
'firebase/auth';
import { firebaseConfig } from './firebase';

/**
 * Danh tính đăng nhập trên Firebase Auth luôn là `<tên đăng nhập>@kpi.bca.vn`,
 * tách khỏi email liên hệ (người dùng có thể sửa) → máy mới vẫn đăng nhập được chỉ bằng tên đăng nhập.
 */
export const authEmail = (username: string) => `${username.trim().toLowerCase()}@kpi.bca.vn`;

/** Thông báo tiếng Việt cho lỗi Firebase Auth */
export function authErrorMessage(err: unknown) {
  const code = (err as {code?: string;}).code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Tài khoản hoặc mật khẩu không đúng.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    case 'auth/too-many-requests':
      return 'Đăng nhập sai quá nhiều lần. Thử lại sau ít phút.';
    case 'auth/network-request-failed':
      return 'Mất kết nối mạng. Kiểm tra mạng rồi thử lại.';
    case 'auth/operation-not-allowed':
      return 'Firebase chưa bật đăng nhập Email/Password (Authentication → Sign-in method).';
    default:
      return 'Không kết nối được máy chủ đăng nhập. Thử lại sau.';
  }
}

/**
 * Phiên Firebase phụ, chỉ giữ trong bộ nhớ: dùng để tạo người dùng / đổi mật khẩu cho tài khoản khác
 * mà không làm người quản trị đang đăng nhập bị đăng xuất.
 */
let adminAuth: Auth | null = null;
async function getAdminAuth() {
  if (!adminAuth) {
    const app: FirebaseApp = getApps().find((a) => a.name === 'kpi-admin') ?? initializeApp(firebaseConfig, 'kpi-admin');
    adminAuth = getAuth(app);
    await setPersistence(adminAuth, inMemoryPersistence);
  }
  return adminAuth;
}

/** Tạo người dùng Auth cho tài khoản mới; đã có thì bỏ qua */
export async function provisionAuthUser(username: string, password: string) {
  const auth = await getAdminAuth();
  try {
    await createUserWithEmailAndPassword(auth, authEmail(username), password);
    return 'created' as const;
  } catch (err) {
    if ((err as {code?: string;}).code === 'auth/email-already-in-use') return 'exists' as const;
    throw new Error(authErrorMessage(err));
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

/**
 * Đặt lại mật khẩu trên Firebase Auth: đăng nhập phiên phụ bằng mật khẩu hiện hành rồi đổi.
 * Người dùng chưa có trên Auth → tạo luôn với mật khẩu mới.
 */
export async function changeAuthPassword(username: string, currentPassword: string, nextPassword: string) {
  const auth = await getAdminAuth();
  try {
    const cred = await signInWithEmailAndPassword(auth, authEmail(username), currentPassword);
    await updatePassword(cred.user, nextPassword);
  } catch (err) {
    const code = (err as {code?: string;}).code;
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, authEmail(username), nextPassword);
        return;
      } catch (createErr) {
        if ((createErr as {code?: string;}).code === 'auth/email-already-in-use') {
          throw new Error('Mật khẩu trên Firebase đã khác mật khẩu lưu trong hệ thống — đặt lại trong Firebase Console (Authentication → Users).');
        }
        throw new Error(authErrorMessage(createErr));
      }
    }
    throw new Error(authErrorMessage(err));
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}