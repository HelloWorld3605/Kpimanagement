import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Profile } from '../types/profile';
import { useAuth } from './AuthContext';
import { useAccess } from './AccessContext';
import { findMember } from '../utils/org';
import { useSyncedState } from '../hooks/useSyncedState';

type ProfileContextValue = {
  profile: Profile;
  saveProfile: (p: Profile) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const empty: Profile = {
  code: '',
  name: '',
  birthDate: '',
  hometown: '',
  rank: '',
  salaryCoefficient: '',
  position: '',
  specialty: '',
  avatar: ''
};

/** Hồ sơ lấy theo cán bộ gắn với tài khoản đang đăng nhập; chỉnh sửa giữ theo từng tài khoản trong phiên. */
export function ProfileProvider({ children }: {children: React.ReactNode;}) {
  const { username } = useAuth();
  const { accounts } = useAccess();
  const [edits, setEdits] = useSyncedState<Record<string, Profile>>('profiles', {});

  const account = accounts.find((a) => a.username === username);
  const memberId = account?.memberId;
  const fallbackName = account?.displayName ?? username ?? '';
  const base = useMemo<Profile>(() => {
    const m = memberId ? findMember(memberId) : undefined;
    // Chưa gắn hồ sơ nhân sự: chỉ có họ tên hiển thị của tài khoản
    if (!m) return { ...empty, name: fallbackName };
    return { ...empty, code: m.code, name: m.name, birthDate: m.birthDate, hometown: m.hometown, rank: m.rank, position: m.position };
  }, [memberId, fallbackName]);

  const profile = username && edits[username] || base;
  const saveProfile = useCallback((p: Profile) => username && setEdits((e) => ({ ...e, [username]: p })), [username]);
  const value = useMemo(() => ({ profile, saveProfile }), [profile, saveProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}