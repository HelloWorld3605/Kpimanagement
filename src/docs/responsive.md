# Responsive — hiện trạng và hướng "co giãn đồng tỉ lệ"

Cập nhật: 22/10/2026. Phạm vi: toàn bộ khung ứng dụng sau đăng nhập (màn đăng nhập không áp dụng).

---

## 1. Mục tiêu

> Ở màn to, giao diện phải **trông giống hệt màn nhỏ về tỉ lệ** — cùng số cột, cùng số dòng nhìn thấy, cùng cảm giác mật độ — chỉ là mọi thứ to lên tương ứng. Không phải "màn to thì thêm khoảng trống, chữ vẫn bé".

Màn chuẩn để thiết kế: **laptop 15,6" (1920×1080, thu phóng Windows 125%) ⇒ khung nhìn 1536 × ~730 px CSS**. Mọi kích thước trong tài liệu này tính theo màn chuẩn đó.

---

## 2. Hiện trạng

### 2.1 Cơ chế cỡ chung

| Thành phần | Cách làm hiện tại | Có co giãn theo màn hình? |
|---|---|---|
| Cỡ gốc | `html.ui-compact { font-size: 80% }` → 1rem = 12,8px | **Không** — cố định 12,8px ở mọi màn |
| Khoảng cách, chiều cao nút, ô nhập, chữ Tailwind (`p-4`, `h-9`, `text-sm`…) | Theo rem | Theo cỡ gốc (hiện cố định) |
| Chữ viết bằng px (`text-[14px]`…) | `index.css` đổi sang rem cho ~17 cỡ | Theo cỡ gốc |
| Rộng/cao viết bằng px | Giữ px | **Không** |

Hệ quả: màn 1536px và màn 2560px có **cùng cỡ chữ 11,2px**; màn to chỉ rộng ra, chữ và bảng trông bé đi, nhiều khoảng trắng.

### 2.2 Mốc màn hình (Tailwind mặc định, không tuỳ chỉnh)

| Mốc | Rộng tối thiểu | Đang dùng cho |
|---|---|---|
| `sm` | 640px | Lưới form 2 cột, ô tìm kiếm cố định rộng, nút "Gọn/Thường" ở thanh chuyển trang, popup căn giữa |
| `md` | 768px | **Hiện sidebar** (dưới mốc này sidebar ẩn, chưa có menu thay thế); bảng kéo tới đáy màn hình; canvas sơ đồ lấp khung |
| `lg` | 1024px | Cơ cấu tổ chức chia 2 cột (cây dính bên trái); form Giao việc KPI 4 cột; Hồ sơ cá nhân 2 cột |
| `xl` | 1280px | Chi tiết danh mục nhiệm vụ có cột lịch sử phiên bản bên phải |
| `2xl` | 1536px | Bảng Danh mục nhiệm vụ: chữ và ô to lại như cũ |

### 2.3 Khung ứng dụng

| Phần | Màn < 768px | Màn ≥ 768px |
|---|---|---|
| Sidebar | Ẩn hoàn toàn (chưa có menu ngăn kéo) | Mở 212px / thu gọn 58px, cố định px |
| Thanh trên cùng | Cao 44px | Cao 44px, cố định px |
| Vùng nội dung | Lề 20/16px theo rem | Như bên trái |
| Bảng danh sách | Cuộn cả trang, không kéo tới đáy | Cuộn cả trang, tiêu đề cột dính dưới thanh trên cùng, thanh chuyển trang dính đáy, ít dòng vẫn kéo tới đáy |

### 2.4 Theo màn

| Màn | Hành vi theo cỡ màn |
|---|---|
| Danh mục nhiệm vụ | Bảng ~1.000px; ≥1536px chữ/ô to hơn; hẹp hơn thì lướt ngang (HorizontalSwipe) |
| Giao việc (Việc KPI / hằng ngày) | Bảng lướt ngang khi hẹp; ô tìm kiếm cố định từ 640px |
| Form Giao việc KPI | ≥1024px: 4 cột, mỗi cột cuộn riêng; nhỏ hơn: xếp dọc |
| Cơ cấu tổ chức | ≥1024px: cây dính trái + chi tiết cuộn theo trang; nhỏ hơn: cây là hộp cao 340px phía trên |
| Sơ đồ tổ chức | ≥768px: canvas lấp đúng phần còn lại; nhỏ hơn: cao theo `100vh − 11.5rem` |
| Chi tiết danh mục | ≥1280px: cột lịch sử phiên bản bên phải, dính khi cuộn |
| Hồ sơ cá nhân | ≥1024px: tiêu đề nhóm bên trái 260px; ≥640px: trường nhập 2 cột |
| Popup / ngăn kéo | Popup căn giữa từ 640px; ngăn kéo chi tiết luôn rộng tối đa 520px |
| Công khai kết quả, Phiếu cấp dưới | Chỉ ô tìm kiếm đổi rộng từ 640px |
| Bảng điểm KPI | Không có xử lý theo cỡ màn (bảng nghiệp vụ cố định, lướt ngang) |

### 2.5 Những chỗ cố định px (không to lên theo cỡ chung)

- Sidebar `212px / 58px`, thanh trên cùng `44px`, vị trí dính `top-[44px]`.
- Biểu tượng `h-[18px]`, thẻ sơ đồ `208px`, hộp cây tổ chức `340px`.
- Độ rộng tối thiểu bảng: `820–1400px`.
- Ngăn kéo `460–520px`, popup to nhất `1680px`.
- Hằng số trong code phải sửa tay cho khớp: `TOPBAR = 44`, `PAGER = 40`, `BOTTOM = 18`, `UI_SCALE = 0.8` (TableFrame), `top = 44, bottom = 18` (useStickyPanelHeight), `-22` (useFillHeight / OrgChart).

---

## 3. Hướng đề xuất: co giãn đồng tỉ lệ

### 3.1 Quy tắc

Cỡ gốc tỉ lệ thuận với chiều rộng màn, lấy màn chuẩn làm mốc:

```
cỡ gốc = 12,8px × (rộng màn / 1536), giới hạn trong [12,8px … 19,2px]
```

```css
html.ui-compact {
  font-size: clamp(12.8px, calc(100vw * 12.8 / 1536), 19.2px);
}
```

| Màn | Rộng CSS | Cỡ gốc | Chữ thân bảng (14px gốc) | So với màn chuẩn |
|---|---|---|---|---|
| Laptop 15,6" 125% (chuẩn) | 1536 | 12,8px | 11,2px | 100% |
| Laptop 14" / 1366×768 | 1366 | 12,8px (sàn) | 11,2px | 100% — không nhỏ thêm |
| Màn 24" 1920×1080 100% | 1920 | 16px | 14px | 125% |
| Màn 27" 2560×1440 100% | 2560 | 19,2px (trần) | 16,8px | 150% |
| Màn 32" 4K 150% | 2560 | 19,2px | 16,8px | 150% |

Sàn giữ màn nhỏ không bé hơn hiện tại; trần tránh chữ quá to trên màn rất rộng (phần dư thành lề hai bên khung nội dung).

### 3.2 Việc cần làm để toàn bộ cùng to lên

1. **Đổi mọi kích thước khung sang rem**: sidebar `16.5625rem / 4.53rem`, thanh trên cùng `3.4375rem`, `top-[44px]` → `top-[3.4375rem]`, biểu tượng thanh trên/thanh lọc, hộp cây, thẻ sơ đồ, độ rộng ngăn kéo/popup, độ rộng tối thiểu bảng.
2. **Bỏ hằng số px trong code**: TableFrame / useStickyPanelHeight / useFillHeight đo trực tiếp chiều cao thanh trên cùng và thanh chuyển trang thay vì `44 / 40 / 18`; bỏ `UI_SCALE`.
3. **Mốc màn hình theo "khung nhìn quy đổi"**: vì nội dung to lên, các mốc `lg` (4 cột form, chia đôi tổ chức) và `xl` (cột phiên bản) vẫn giữ px như cũ là hợp lý — ở màn to nội dung to đúng tỉ lệ nên bố cục giống màn chuẩn. Bỏ riêng `2xl:` ở bảng Danh mục (đã có co giãn chung).
4. **Ảnh/biểu tượng**: chim Lạc, trống đồng sidebar, logo đổi sang rem để to cùng.
5. **Không áp dụng**: màn đăng nhập; bảng điểm in/xuất PDF, Word, Excel (cỡ theo văn bản hành chính).

### 3.3 Kết quả mong đợi

- Màn 24" và 27" nhìn **giống ảnh phóng to** của laptop 15,6": cùng số cột hiện, cùng số dòng trên một màn (±1), sidebar chiếm cùng tỉ lệ bề ngang (~14%).
- Laptop nhỏ hơn màn chuẩn giữ nguyên như hiện tại.

### 3.4 Còn mở

- **Màn < 768px**: sidebar đang ẩn và chưa có menu ngăn kéo. Cần quyết định có hỗ trợ điện thoại/máy tính bảng hay chỉ hỗ trợ từ 1024px trở lên.
- **Trần 150%**: có thể hạ xuống 135% nếu thấy chữ quá to ở 27".
