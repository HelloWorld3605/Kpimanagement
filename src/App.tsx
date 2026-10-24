import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { StyleGuide } from './pages/StyleGuide';
import { ModulePlaceholder } from './pages/ModulePlaceholder';
import { TaskCatalogList } from './pages/catalog/TaskCatalogList';
import { TaskCatalogDetail } from './pages/catalog/TaskCatalogDetail';
import { TaskCatalogCreate } from './pages/catalog/TaskCatalogCreate';
import { TaskCatalogProvider } from './contexts/TaskCatalogContext';
import { CriteriaCatalogProvider } from './contexts/CriteriaCatalogContext';
import { CriteriaCatalog } from './pages/catalog/CriteriaCatalog';
import { SelfReviewProvider } from './contexts/SelfReviewContext';
import { SelfReviewList } from './pages/selfReview/SelfReviewList';
import { SelfReviewDetail } from './pages/selfReview/SelfReviewDetail';
import { builtPaths, hiddenNavItems, navEntries, NavItem } from './data/navigation';
import { ProfileProvider } from './contexts/ProfileContext';
import { ProfilePage } from './pages/ProfilePage';
import { OrgStructure } from './pages/OrgStructure';
import { PublishedResults } from './pages/PublishedResults';
import { AccessProvider } from './contexts/AccessContext';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { HomeRedirect, RequireFeature } from './components/RequireFeature';
import { Login } from './pages/Login';
import { UserAccounts } from './pages/admin/UserAccounts';
import { RoleList } from './pages/admin/RoleList';
import { RoleDetail } from './pages/admin/RoleDetail';
import { RoleCreate } from './pages/admin/RoleCreate';
import { UserCreate } from './pages/admin/UserCreate';
import { UserDetail } from './pages/admin/UserDetail';
import { UserEdit } from './pages/admin/UserEdit';
import { StaffList } from './pages/admin/StaffList';
import { StaffCreate } from './pages/admin/StaffCreate';
import { StaffDetail } from './pages/admin/StaffDetail';
import { StaffEdit } from './pages/admin/StaffEdit';
import { RequireMember } from './components/RequireMember';
import { PermissionList } from './pages/admin/PermissionList';
import { PermissionDetail } from './pages/admin/PermissionDetail';
import { DataScope } from './pages/admin/DataScope';
import { NoAccess } from './pages/NoAccess';
import { TaskManagement } from './pages/work/TaskManagement';
import { WorkProvider } from './contexts/WorkContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Notifications } from './pages/Notifications';
import { KpiPeriodList } from './pages/period/KpiPeriodList';
import { KpiPeriodDetail } from './pages/period/KpiPeriodDetail';
import { AppraisalList } from './pages/appraisal/AppraisalList';
import { MyTasks } from './pages/work/MyTasks';
import { EventTimeline } from './pages/work/EventTimeline';
import { Dashboard } from './pages/Dashboard';
import { AppraisalDetail } from './pages/appraisal/AppraisalDetail';

const placeholderItems = [...navEntries.flatMap((e): NavItem[] => e.type === 'link' ? [e] : e.items), ...hiddenNavItems].filter(
  (i) => !builtPaths.includes(i.path)
);

type AppProps = {
  /** Hiện mục "Đổi tài khoản demo" trong menu tài khoản để chuyển nhanh giữa các vai trò */
  demoAccountSwitcher?: boolean;
};

export function App({ demoAccountSwitcher = true }: AppProps) {
  return (
    <BrowserRouter>
      <AccessProvider demoSwitcher={demoAccountSwitcher}>
      <AuthProvider>
      <ProfileProvider>
      <TaskCatalogProvider>
        <CriteriaCatalogProvider>
        <SelfReviewProvider>
        <WorkProvider>
        <NotificationProvider>
        <Routes>
          <Route path="/dang-nhap" element={<Login />} />
          <Route
                          element={
                          <RequireAuth>
                <AppShell />
              </RequireAuth>
                          }>
                          
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/theo-doi-tien-do" element={<Navigate to="/quan-ly-nhiem-vu" replace />} />
            <Route path="/bao-cao-kpi" element={<Navigate to="/" replace />} />
            <Route path="/phan-nhom-can-bo" element={<Navigate to="/" replace />} />
            <Route path="/danh-muc-nhiem-vu" element={<RequireFeature feature="task-catalog"><TaskCatalogList /></RequireFeature>} />
            <Route path="/danh-muc-nhiem-vu/tao-moi" element={<RequireFeature feature="task-catalog" action="write"><TaskCatalogCreate /></RequireFeature>} />
            <Route path="/danh-muc-nhiem-vu/:code" element={<RequireFeature feature="task-catalog"><TaskCatalogDetail /></RequireFeature>} />
            <Route path="/danh-muc-tieu-chi" element={<RequireFeature feature="criteria-catalog"><CriteriaCatalog /></RequireFeature>} />
            <Route path="/quan-ly-nhiem-vu" element={<RequireFeature feature="task-assign"><RequireMember><TaskManagement /></RequireMember></RequireFeature>} />
            <Route path="/giao-viec" element={<Navigate to="/quan-ly-nhiem-vu" replace />} />
            <Route path="/bang-diem-kpi" element={<Navigate to="/tu-danh-gia" replace />} />
            <Route path="/tu-danh-gia" element={<RequireFeature feature="self-review"><RequireMember><SelfReviewList /></RequireMember></RequireFeature>} />
            <Route path="/tu-danh-gia/:id" element={<RequireFeature feature="self-review"><RequireMember><SelfReviewDetail /></RequireMember></RequireFeature>} />
            <Route path="/tai-lieu-ui" element={<RequireFeature feature="style-guide"><StyleGuide /></RequireFeature>} />
            <Route path="/ho-so-ca-nhan" element={<RequireMember><ProfilePage /></RequireMember>} />
            <Route path="/thong-bao" element={<RequireFeature feature="notifications"><Notifications /></RequireFeature>} />
            <Route path="/co-cau-to-chuc" element={<RequireFeature feature="org"><OrgStructure /></RequireFeature>} />
            <Route path="/cong-khai-ket-qua" element={<RequireFeature feature="results"><PublishedResults /></RequireFeature>} />
            <Route path="/nguoi-dung" element={<RequireFeature feature="admin"><UserAccounts /></RequireFeature>} />
            <Route path="/nguoi-dung/tao-moi" element={<RequireFeature feature="admin" action="write"><UserCreate /></RequireFeature>} />
            <Route path="/nguoi-dung/:username" element={<RequireFeature feature="admin"><UserDetail /></RequireFeature>} />
            <Route path="/nguoi-dung/:username/sua" element={<RequireFeature feature="admin" action="write"><UserEdit /></RequireFeature>} />
            <Route path="/nhan-su" element={<RequireFeature feature="admin"><StaffList /></RequireFeature>} />
            <Route path="/nhan-su/tao-moi" element={<RequireFeature feature="admin" action="write"><StaffCreate /></RequireFeature>} />
            <Route path="/nhan-su/:id" element={<RequireFeature feature="admin"><StaffDetail /></RequireFeature>} />
            <Route path="/nhan-su/:id/sua" element={<RequireFeature feature="admin" action="write"><StaffEdit /></RequireFeature>} />
            <Route path="/vai-tro" element={<RequireFeature feature="admin"><RoleList /></RequireFeature>} />
            <Route path="/vai-tro/tao-moi" element={<RequireFeature feature="admin" action="write"><RoleCreate /></RequireFeature>} />
            <Route path="/vai-tro/:id" element={<RequireFeature feature="admin"><RoleDetail /></RequireFeature>} />
            <Route path="/quyen" element={<RequireFeature feature="admin"><PermissionList /></RequireFeature>} />
            <Route path="/quyen/:code" element={<RequireFeature feature="admin"><PermissionDetail /></RequireFeature>} />
            <Route path="/ky-kpi" element={<RequireFeature feature="kpi-period"><KpiPeriodList /></RequireFeature>} />
            <Route path="/ky-kpi/:id" element={<RequireFeature feature="kpi-period"><KpiPeriodDetail /></RequireFeature>} />
            <Route path="/ky-danh-gia" element={<Navigate to="/ky-kpi" replace />} />
            <Route path="/nhiem-vu-cua-toi" element={<RequireFeature feature="my-tasks"><RequireMember><MyTasks /></RequireMember></RequireFeature>} />
            <Route path="/tao-cong-viec" element={<Navigate to="/quan-ly-nhiem-vu" replace />} />
            <Route path="/tong-quan" element={<RequireFeature feature="overview"><RequireMember><Dashboard /></RequireMember></RequireFeature>} />
            <Route path="/lich-cong-viec" element={<RequireFeature feature="work-calendar"><RequireMember><EventTimeline /></RequireMember></RequireFeature>} />
            <Route path="/duyet-san-pham" element={<Navigate to="/quan-ly-nhiem-vu" replace />} />
            <Route path="/tham-dinh" element={<RequireFeature feature="appraisal"><RequireMember><AppraisalList /></RequireMember></RequireFeature>} />
            <Route path="/tham-dinh/:id" element={<RequireFeature feature="appraisal"><RequireMember><AppraisalDetail /></RequireMember></RequireFeature>} />
            <Route path="/pham-vi-du-lieu" element={<RequireFeature feature="admin"><DataScope /></RequireFeature>} />
            {placeholderItems.map((i) =>
                          <Route key={i.path} path={i.path} element={<RequireFeature feature={i.feature}><ModulePlaceholder /></RequireFeature>} />
                          )}
            <Route path="*" element={<NoAccess />} />
          </Route>
        </Routes>
        </NotificationProvider>
        </WorkProvider>
        </SelfReviewProvider>
        </CriteriaCatalogProvider>
      </TaskCatalogProvider>
      </ProfileProvider>
      </AuthProvider>
      </AccessProvider>
    </BrowserRouter>);

}