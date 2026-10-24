import { useSyncExternalStore } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../utils/firebase';

/** Trạng thái đăng nhập Firebase dùng chung cho cả ứng dụng (một lần theo dõi) */
type Snapshot = {user: User | null;ready: boolean;};

let snapshot: Snapshot = { user: null, ready: !firebaseAuth };
const listeners = new Set<() => void>();

if (firebaseAuth) {
  onAuthStateChanged(firebaseAuth, (user) => {
    snapshot = { user, ready: true };
    listeners.forEach((l) => l());
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** user: người dùng Firebase hiện tại; ready: đã biết trạng thái (Firebase khôi phục phiên xong) */
export function useFirebaseUser() {
  return useSyncExternalStore(subscribe, () => snapshot);
}