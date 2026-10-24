# Kết nối Firebase

Ứng dụng chạy được ở hai chế độ:

| | Chưa cấu hình (mặc định) | Đã cấu hình |
|---|---|---|
| Đăng nhập | So mật khẩu lưu trong dữ liệu mẫu | Firebase Auth (email + mật khẩu) |
| Dữ liệu | Trong trình duyệt, mất khi tải lại | Firestore, còn sau khi tải lại, dùng chung giữa các máy |

## 1. Tạo project
1. Vào https://console.firebase.google.com → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
3. **Build → Firestore Database → Create database** (chọn vùng `asia-southeast1`).
4. **Project settings → Your apps → Web (</>)** → đăng ký app → chép đoạn `firebaseConfig`.

## 2. Điền cấu hình
Dán các giá trị vào `firebaseConfig` trong `utils/firebase.ts`. Chỉ cần `apiKey` và `projectId` có giá trị là ứng dụng chuyển sang dùng Firebase.

## 3. Security Rules (Firestore → Rules)
Chỉ người đã đăng nhập mới đọc / ghi được:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mọi bộ sưu tập của ứng dụng
    match /{collection}/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Lưu ý:** quy tắc cũ chỉ mở `kpi-app` — phải thay bằng quy tắc trên rồi **Publish**, nếu không các bộ sưu tập tách bản ghi sẽ không đọc / ghi được.

## Dữ liệu được lưu

### Tách từng bản ghi (mỗi phần tử một tài liệu)
Mỗi tài liệu có `json` (nội dung), `order` (thứ tự hiển thị), `updatedAt`.

| Bộ sưu tập | Mã tài liệu | Nội dung |
|---|---|---|
| `accounts` | tên đăng nhập | Tài khoản người dùng |
| `roles` | mã vai trò | Vai trò tạo thêm |
| `taskCatalog` | mã nhiệm vụ (TM-01…) | Danh mục nhiệm vụ |
| `criteriaSets` | mã bộ tiêu chí | Bộ tiêu chí |
| `kpiTasks` | mã việc | Việc KPI |
| `dailyTasks` | mã việc | Việc hằng ngày |
| `selfReviews` | mã phiếu | Phiếu tự đánh giá |
| `notifications` | mã thông báo | Thông báo |
| `units` | mã đơn vị | Cơ cấu tổ chức (cây đơn vị theo `parentId`) |
| `members` | mã cán bộ | Hồ sơ cán bộ, đơn vị công tác, kết quả các quý |

Lần đầu (bộ sưu tập trống) dữ liệu khởi đầu được đưa lên và đánh dấu ở `kpi-meta/{bộ sưu tập}`. Đã đánh dấu thì xoá hết cũng không bị nạp lại.

### Cấu hình (một tài liệu trong `kpi-app`)
| Tài liệu | Nội dung |
|---|---|
| `roleFeatures`, `roleScopes` | Quyền chức năng, phạm vi dữ liệu theo vai trò |
| `profiles` | Hồ sơ cá nhân đã chỉnh |
| `scoresheetLocks` | Ngày chốt bảng điểm KPI theo từng người / đơn vị |

Dữ liệu cũ dạng một tài liệu (`kpi-app/accounts`, `kpi-app/kpiTasks`…) không còn được dùng, có thể xoá trong Console.

## Đăng nhập
- Danh tính trên Firebase Auth luôn là `<tên đăng nhập>@kpi.bca.vn` (tách khỏi email liên hệ trong hồ sơ).
- Tài khoản mẫu (vd. `admin` / `123456`) chưa có trên Firebase Auth: lần đăng nhập đầu với đúng mật khẩu sẽ tự tạo. Từ lần sau Firebase kiểm mật khẩu.
- Tạo người dùng trong màn Người dùng → tạo luôn người dùng trên Firebase Auth.
- Đặt lại mật khẩu trong màn Sửa người dùng → đổi luôn trên Firebase Auth (thất bại thì không lưu).
- Đổi nhanh tài khoản demo → đăng nhập lại Firebase bằng mật khẩu lưu của tài khoản đó.
- Đăng xuất ở Firebase (hết phiên) → app tự về màn đăng nhập.
- Trước khi đăng nhập, app dùng dữ liệu mẫu tại chỗ; sau khi đăng nhập mới đọc dữ liệu thật từ Firestore.

## Lưu ý bảo mật (bản thử nghiệm)
- Mật khẩu vẫn được lưu kèm tài khoản trong tài liệu `accounts` để đặt lại mật khẩu từ trình duyệt. Khi đưa vào dùng thật nên chuyển việc tạo người dùng / đặt lại mật khẩu sang Cloud Functions (Admin SDK) và bỏ trường mật khẩu khỏi Firestore.
- Security Rules hiện cho mọi người đã đăng nhập đọc / ghi toàn bộ; phân quyền theo vai trò đang kiểm trong app.

## Quy tắc bảo vệ dữ liệu (mẫu — cần quản trị dự án triển khai)

Hiện quyền chỉ được lọc trên giao diện. Bộ quy tắc dưới đây là mẫu để triển khai lên Firestore; các thao tác chính thức đi qua Cloud Functions.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function me() { return get(/databases/$(db)/documents/users/$(request.auth.uid)).data; }
    function inScope(unitId) { return unitId in me().scopeUnitIds; }
    function hasRole(r) { return r in me().roles; }

    // Kỳ KPI: đọc theo phạm vi; ghi chỉ người lập kế hoạch; kỳ đã đóng không sửa trực tiếp
    match /kpiPeriods/{id} {
      allow read: if signedIn() && inScope(resource.data.unitId);
      allow create: if signedIn() && hasRole('lap-ke-hoach') && inScope(request.resource.data.unitId);
      allow update: if signedIn() && hasRole('lap-ke-hoach') && resource.data.phase != 'closed'
        // Hạn tự đánh giá thay đổi thì lịch sử phải dài thêm (có người, thời điểm, căn cứ)
        && (request.resource.data.deadlineRules == resource.data.deadlineRules
            || request.resource.data.deadlineHistory.size() > resource.data.deadlineHistory.size())
        // Không đổi phiên bản kết quả / mở lại kỳ từ máy khách
        && request.resource.data.resultVersion == resource.data.resultVersion;
      allow delete: if signedIn() && hasRole('lap-ke-hoach') && resource.data.phase == 'draft';
    }

    // Việc KPI: cán bộ chỉ sửa trường kết quả của mình; trường đánh giá chỉ Functions ghi
    match /kpiTasks/{id} {
      allow read: if signedIn() && (resource.data.assigneeId == request.auth.uid || inScope(resource.data.unitId));
      allow update: if signedIn() && resource.data.assigneeId == request.auth.uid
        && !request.resource.data.diff(resource.data).affectedKeys()
             .hasAny(['qualityAssessment','scheduleAssessment','revisionCount','scheduleReminderCount','confirmedBy','confirmedAt','baseScore','targetVersions']);
    }

    // Phiếu đánh giá: điểm đã phê duyệt và quyết định xếp loại chỉ Functions ghi
    match /reviews/{id} {
      allow read: if signedIn() && (resource.data.ownerId == request.auth.uid || inScope(resource.data.unitId));
      allow update: if signedIn() && resource.data.ownerId == request.auth.uid && resource.data.step == 'self';
    }
  }
}
```

Cloud Functions (khung): `computeScore`, `appraise`, `decideRating`, `approveTargetAdjustment`, `reopenPeriod`. Mỗi hàm kiểm tra thẩm quyền và điều kiện (kỳ chưa đóng, đúng cấp duyệt), ghi kết quả và nhật ký nghiệp vụ trong cùng một transaction. `reopenPeriod` bắt buộc lý do + người duyệt và tăng `resultVersion`, giữ phiên bản cũ.

Mật khẩu không lưu trong dữ liệu nghiệp vụ — xác thực qua Firebase Auth.

## Chưa làm (giai đoạn sau)
- Mỗi nhóm dữ liệu là một tài liệu (giới hạn 1MB) — đủ cho dữ liệu mẫu; khi dữ liệu thật lớn nên tách thành từng bản ghi.
- Kỳ KPI, kết quả công khai, mẫu bảng điểm vẫn là dữ liệu mẫu cố định (chỉ ngày chốt bảng điểm được lưu: `scoresheetLocks`).
