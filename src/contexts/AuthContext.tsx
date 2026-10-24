import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut } from
'firebase/auth';
import { useAccess } from './AccessContext';
import { DEMO_PASSWORD } from '../data/accounts';
import { accountStatus, loginBlockedMessage } from '../utils/accountStatus';
import { firebaseAuth } from '../utils/firebase';
import { authEmail, authErrorMessage } from '../utils/firebaseAccounts';
import { useFirebaseUser } from '../hooks/useFirebaseUser';

type AuthContextValue = {
  username: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  /** Đăng nhập nhanh bằng tài khoản demo (dùng mật khẩu lưu của tài khoản đó) */
  loginAs: (username: string) => Promise<void>;
  logout: () => void;
};

const KEY = 'kpi.session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession() {
  try {
    return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeSession(username: string, remember: boolean) {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  (remember ? localStorage : sessionStorage).setItem(KEY, username);
}

/**
 * Đăng nhập Firebase Auth bằng danh tính `<tên đăng nhập>@kpi.bca.vn`.
 * Người dùng chưa có trên Firebase (dữ liệu mẫu / tài khoản tạo trước khi nối Firebase) → tự tạo,
 * chỉ khi mật khẩu vừa nhập khớp mật khẩu lưu trong hệ thống (canProvision).
 */
async function firebaseSignIn(username: string, password: string, remember: boolean, canProvision: boolean) {
  const auth = firebaseAuth!;
  const email = authEmail(username);
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    const code = (err as {code?: string;}).code;
    const missing = code === 'auth/user-not-found' || code === 'auth/invalid-credential';
    if (!missing || !canProvision) throw new Error(authErrorMessage(err));
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (createErr) {
      // Đã có trên Firebase với mật khẩu khác → sai mật khẩu
      throw new Error(authErrorMessage((createErr as {code?: string;}).code === 'auth/email-already-in-use' ? err : createErr));
    }
  }
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const { accounts, updateAccount } = useAccess();
  const [username, setUsername] = useState<string | null>(readSession);
  const firebase = useFirebaseUser();

  const clearSession = useCallback(() => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    setUsername(null);
  }, []);

  // Có Firebase: phiên trong app phải đi kèm phiên Firebase (hết hạn / đăng xuất ở máy khác → về màn đăng nhập)
  useEffect(() => {
    if (firebaseAuth && firebase.ready && username && !firebaseAuth.currentUser) clearSession();
  }, [firebase.ready, firebase.user, username, clearSession]);

  const stampLogin = useCallback(
    (name: string) => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      updateAccount(name, { lastLogin: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}` });
    },
    [updateAccount]
  );

  const login = useCallback(
    async (user: string, password: string, remember: boolean) => {
      const name = user.trim().toLowerCase();
      if (!name || !password) throw new Error('Vui lòng nhập tài khoản và mật khẩu.');
      const account = accounts.find((a) => a.username === name);

      if (firebaseAuth) {
        // Trước khi đăng nhập chưa đọc được dữ liệu trên máy chủ → tài khoản tạo ở máy khác có thể chưa có trong
        // danh sách tại chỗ; Firebase vẫn kiểm được mật khẩu. Trạng thái tài khoản kiểm lại sau khi dữ liệu về.
        if (account) {
          const status = accountStatus(account);
          if (status !== 'active') throw new Error(loginBlockedMessage[status]);
        }
        await firebaseSignIn(name, password, remember, !!account && password === (account.password ?? DEMO_PASSWORD));
      } else {
        await new Promise((r) => setTimeout(r, 500));
        if (!account || password !== (account.password ?? DEMO_PASSWORD)) throw new Error('Tài khoản hoặc mật khẩu không đúng.');
        const status = accountStatus(account);
        if (status !== 'active') throw new Error(loginBlockedMessage[status]);
      }
      writeSession(name, remember);
      setUsername(name);
      stampLogin(name);
    },
    [accounts, stampLogin]
  );

  const loginAs = useCallback(
    async (name: string) => {
      if (firebaseAuth) {
        const account = accounts.find((a) => a.username === name);
        const password = account?.password ?? DEMO_PASSWORD;
        await firebaseSignIn(name, password, true, true);
      }
      writeSession(name, true);
      setUsername(name);
      stampLogin(name);
    },
    [accounts, stampLogin]
  );

  const logout = useCallback(() => {
    if (firebaseAuth) signOut(firebaseAuth).catch(() => undefined);
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ username, login, loginAs, logout }), [username, login, loginAs, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}