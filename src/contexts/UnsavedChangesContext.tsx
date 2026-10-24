import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, btnPrimary, btnSecondary, btnTransition } from '../components/ui/Modal';

type UnsavedChangesValue = {
  register: (id: string, dirty: boolean) => void;
  /** Chạy ngay nếu không có thay đổi chưa lưu, ngược lại hỏi trước */
  confirmLeave: (go: () => void) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesValue>({ register: () => undefined, confirmLeave: (go) => go() });

/**
 * Chặn rời trang khi còn thay đổi chưa lưu:
 * - Bấm liên kết trong ứng dụng (sidebar, breadcrumb, menu…) → hỏi "Bỏ thay đổi?"
 * - Tải lại / đóng tab → hộp xác nhận của trình duyệt
 */
export function UnsavedChangesProvider({ children }: {children: React.ReactNode;}) {
  const dirtyIds = useRef(new Set<string>());
  const [pending, setPending] = useState<(() => void) | null>(null);
  const navigate = useNavigate();

  const register = useCallback((id: string, dirty: boolean) => {
    if (dirty) dirtyIds.current.add(id);else
    dirtyIds.current.delete(id);
  }, []);

  const confirmLeave = useCallback((go: () => void) => {
    if (!dirtyIds.current.size) go();else
    setPending(() => go);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirtyIds.current.size || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const to = url.pathname + url.search + url.hash;
      if (to === window.location.pathname + window.location.search + window.location.hash) return;
      // Pha bắt (capture) trên window chạy trước bộ xử lý của React → chặn được Link
      e.preventDefault();
      e.stopPropagation();
      setPending(() => () => navigate(to));
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyIds.current.size) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [navigate]);

  const discard = () => {
    const go = pending;
    dirtyIds.current.clear();
    setPending(null);
    go?.();
  };

  const value = useMemo(() => ({ register, confirmLeave }), [register, confirmLeave]);

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Bỏ thay đổi?"
        description="Bạn có thay đổi chưa lưu trên màn này."
        footer={
        <div className="flex justify-end gap-2">
            <button type="button" data-autofocus onClick={() => setPending(null)} className={btnSecondary} style={btnTransition}>
              Ở lại
            </button>
            <button type="button" onClick={discard} className={btnPrimary} style={btnTransition}>
              Bỏ thay đổi
            </button>
          </div>
        }>
        
        <p className="px-4 py-4 text-[14px] leading-relaxed text-gray-700">Rời khỏi đây thì những thay đổi chưa lưu sẽ mất. Chọn “Ở lại” để quay lại lưu.</p>
      </Modal>
    </UnsavedChangesContext.Provider>);

}

/** Đăng ký trạng thái "có thay đổi chưa lưu" của màn hiện tại */
export function useUnsavedChanges(dirty: boolean) {
  const { register } = useContext(UnsavedChangesContext);
  const id = useId();
  useEffect(() => {
    register(id, dirty);
    return () => register(id, false);
  }, [id, dirty, register]);
}

/** Điều hướng bằng code nhưng vẫn hỏi khi còn thay đổi chưa lưu */
export function useGuardedNavigate() {
  const { confirmLeave } = useContext(UnsavedChangesContext);
  const navigate = useNavigate();
  return useCallback((to: string) => confirmLeave(() => navigate(to)), [confirmLeave, navigate]);
}