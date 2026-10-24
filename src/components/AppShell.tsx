import React, { useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PageHeader } from './PageHeader';
import { PageTabsProvider } from '../contexts/PageTabsContext';
import { BreadcrumbProvider } from '../contexts/BreadcrumbContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TableSearchProvider } from '../contexts/TableSearchContext';
import { UnsavedChangesProvider } from '../contexts/UnsavedChangesContext';
import { consumeScrollRestore } from '../hooks/useListState';
import { STICKY_TOP_EVENT, TOPBAR_HEIGHT } from '../utils/stickyTop';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [tabsSlot, setTabsSlot] = useState<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Thu toàn bộ giao diện trong ứng dụng về 80% (chữ, khoảng cách, nút, bảng, popup); màn đăng nhập giữ nguyên
  useLayoutEffect(() => {
    document.documentElement.classList.add('ui-compact');
    return () => document.documentElement.classList.remove('ui-compact');
  }, []);

  // Hàng tab dính dưới thanh trên cùng → đo chiều cao, ghi --sticky-top cho các phần dính khác nằm ngay bên dưới
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!tabsSlot || !scroller) return;
    const update = () => {
      const top = TOPBAR_HEIGHT + Math.round(tabsSlot.getBoundingClientRect().height);
      if (scroller.style.getPropertyValue('--sticky-top') === `${top}px`) return;
      scroller.style.setProperty('--sticky-top', `${top}px`);
      window.dispatchEvent(new Event(STICKY_TOP_EVENT));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(tabsSlot);
    return () => observer.disconnect();
  }, [tabsSlot]);

  // Đổi màn → về đầu trang, trừ khi màn danh sách vừa tự trả lại vị trí cuộn cũ
  useLayoutEffect(() => {
    if (consumeScrollRestore()) return;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <ThemeProvider>
    <BreadcrumbProvider>
    <UnsavedChangesProvider>
    <TableSearchProvider>
      {/* Khung ứng dụng cố định theo cửa sổ: tài liệu không bao giờ cuộn, chỉ cột nội dung cuộn.
                 overflow: clip (không phải hidden) để trình duyệt không thể cuộn ngầm khung này khi focus/đổi nội dung. */}
      <div className="fixed inset-0 flex bg-canvas" style={{ overflow: 'clip' }}>
        <Sidebar collapsed={collapsed} />
        {/* Vùng cuộn chính của mọi màn: bảng danh sách dính tiêu đề cột / thanh chuyển trang theo vùng này */}
        <div ref={scrollRef} data-app-scroll className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden [overflow-anchor:none]">
          <div className="sticky top-0 z-30">
            <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />
          </div>
          <main className="flex flex-1 flex-col px-5 pb-5 pt-4">
            <PageHeader />
            {/* Khung nội dung: viền mảnh, góc cứng, nền giấy — luôn kéo tới đáy màn hình */}
            <section className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white">
              {/* Hàng tab của màn dính ngay dưới thanh trên cùng khi cuộn */}
              <div ref={setTabsSlot} className="sticky top-[44px] z-20 rounded-t-lg bg-white" />
              <div className="page-body flex flex-1 flex-col">
                <PageTabsProvider slot={tabsSlot}>
                  <Outlet />
                </PageTabsProvider>
              </div>
            </section>
          </main>
        </div>
      </div>
      {/* Thông báo nhỏ sau mỗi thao tác — đặt trên thanh chuyển trang dính đáy */}
      <Toaster
              position="bottom-right"
              offset={{ bottom: 64, right: 20 }}
              visibleToasts={3}
              closeButton
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgb(var(--surface))',
                  color: 'rgb(var(--gray-900))',
                  border: '1px solid rgb(var(--gray-200))',
                  borderRadius: 'calc(var(--radius) * 3)',
                  fontFamily: 'inherit',
                  fontSize: 14
                },
                actionButtonStyle: { background: 'rgb(var(--brand-600))', color: '#fff', fontWeight: 600 }
              }} />
            
    </TableSearchProvider>
    </UnsavedChangesProvider>
    </BreadcrumbProvider>
    </ThemeProvider>);

}