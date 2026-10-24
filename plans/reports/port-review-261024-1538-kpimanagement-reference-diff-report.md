# Đối chiếu Kpimanagement-reference → Kpimanagement (24/10/2026)

Phạm vi port: (1) Chỉnh sửa cơ cấu + bỏ "Thêm trực thuộc" + layout nhân sự tự đầy; (2) Phụ lục phương pháp quy đổi; (3) nút In / Xuất dùng chung.

## File có ở reference — đã có đủ ở bản hiện tại
`diff -rq` không còn dòng "Only in reference".

## Chép nguyên, so lại byte-by-byte = IDENTICAL (21 file)
conversion/AppendixExport, conversion/ConversionAppendixTable, orgEditor/{OrgBulkPanel, OrgEditorDialog, OrgEditorRow, useOrgEditor}, org/UnitMembersDrawer, ui/PrintExportMenu, data/conversionAppendix, pages/catalog/ConversionAppendix, utils/{conversionAppendixExport, orgEditor, orgEditorXlsx, tableExport}, ui/{ExportDropdown, TableToolbar}, scoresheet/ScoresheetExport, selfReview/ExportMenu, org/{UnitMembers, OrgChartNode}.
(`ui/TableFrame` cũng chép nguyên, sau đó sửa thêm phần ô "không có dữ liệu" — xem dưới.)

## 31 file còn khác — dòng chỉ reference có, và lý do
| File | Dòng reference có mà hiện tại không | Lý do |
|---|---|---|
| App.tsx, data/navigation.ts | (cùng nội dung) route / path `/quy-tac-tinh-diem` | Chỉ khác vị trí dòng |
| pages/OrgStructure.tsx | Nút "Thêm trực thuộc", dialog thêm đơn vị con | Bỏ theo yêu cầu; sửa icon ✏️/🗑 bị bóp 1,2px |
| components/org/OrgTree.tsx | mở sẵn `td1` | Tiểu đoàn 1 đã xoá |
| ui/TableFrame.tsx | (không có) | Thêm: ô "không có dữ liệu" phủ kín khung; màn thấp thu đệm |
| data/orgUnits.ts | 19 đơn vị cũ (phòng, đội, tiểu đoàn…) | Đã xoá theo yêu cầu, thay bằng cơ cấu E11 |
| data/orgMembers.ts | chỉ `unitId` cũ (+1 chú thích) | Cán bộ đã chuyển về BTL / E11 |
| data/accounts.ts, data/kpiScoresheets.ts | `bx`, `d-tonghop` | Đơn vị cũ đã xoá |
| utils/scoresheet.ts, utils/scoresheetXlsx.ts, selfReview/LevelPartsEditor | chữ "Đảm bảo…", ghi chữ vào ô Excel | Đã đổi sang % như mẫu 3a/3b/3c |
| admin/StaffForm, utils/staffForm, pages/admin/{StaffCreate, StaffEdit, StaffList} | chọn tài khoản có sẵn, Cơ quan + Phòng ban tách đôi, cột tài khoản cũ | Tài khoản theo số hiệu, ô đơn vị dạng cây, nhập Excel, chuyển đơn vị hàng loạt |
| admin/UserForm, utils/userForm, pages/admin/{UserCreate, UserEdit, UserAccounts} | tên đăng nhập kiểu `nguyenvana`, mật khẩu ≥ 8, lọc trạng thái cũ | Tên đăng nhập = số hiệu, bắt đổi mật khẩu, đặt lại mặc định, lọc "Chưa đổi mật khẩu" |
| contexts/AccessContext.tsx | dòng `replaceUnits` (do cách diff căn khối — hiện tại vẫn có 4 dòng `replaceUnits`), effectiveFeatures cũ | Siêu quản trị luôn toàn quyền; vai trò chỉ huy theo cương vị |
| hooks/useDeleteStaff.ts | giữ tài khoản hoạt động khi xoá | Xoá nhân sự thì ngừng tài khoản |
| components/RequireAuth.tsx, types/access.ts | (không có) | Thêm bắt đổi mật khẩu lần đầu |
| types/org.ts, utils/org.ts | `MemberStatus` thiếu `retired` | Thêm trạng thái "Đã nghỉ / chuyển công tác"; `unitTreeOptions` |
| pages/admin/{DataScope, RoleDetail} | (không có) | Khoá vai trò Siêu quản trị |
| utils/firebase.ts | `isFirebaseConfigured` không có biến môi trường | Thêm `VITE_DISABLE_FIREBASE` để chạy thử tại máy |

Kết luận: không phần nào của 3 tính năng bị thiếu; mọi khác biệt còn lại là thay đổi theo yêu cầu hoặc làm sau reference.

## Kiểm tra trên trình duyệt (localhost, không Firebase)
- Chỉnh sửa cơ cấu: mở, thêm đơn vị con, Lưu → cây cập nhật. Nút "Thêm trực thuộc" không còn.
- Phụ lục: hiển thị bảng + lưu ý; In / Xuất (PDF · Word · Excel).
- In / Xuất: 22 trang không còn nút "In"/"Xuất" kiểu cũ.
- Layout nhân sự (cột chi tiết cơ cấu): 10/trang và 50/trang — phân trang luôn ở đáy (0–8px).
- Ô "không có dữ liệu", 9 màn × 2 cỡ thật: 646px (iframe-free, cửa sổ thật) và 1536×1000 (iframe, khung nhìn thật) — phủ kín (blank 0), canh giữa (0,50), luôn nằm trên thanh phân trang.
