# Quy trình nghiệp vụ — Kỳ KPI, Công việc, Giao việc và Tự đánh giá KPI

> Phiên bản 23/10/2026. Tài liệu này **bổ sung và thay thế** các phần tương ứng trong `nghiep-vu-danh-gia-kpi.md` (mục 4 Kỳ đánh giá, mục 9 Quy trình, mục 12 Cấu trúc chức năng). Công thức KPI (mục 6) và quy đổi 70 điểm (mục 8) giữ nguyên.
>
> Các quy tắc ghi **[BẮT BUỘC]** là ràng buộc hệ thống phải chặn, không chỉ cảnh báo.

---

## 1. Tóm tắt thay đổi

| # | Hiện tại | Mới |
|---|---|---|
| 1 | Kỳ KPI dùng chung toàn hệ thống, chỉ có quý | Kỳ KPI **gắn với đơn vị**, có 3 loại: **Tháng · Quý · Năm** |
| 2 | Màn "Giao việc" vừa tạo vừa giao trong một bước | Tách 2 màn: **Công việc** (tạo việc) và **Giao việc** (gán người/đơn vị + kỳ) |
| 3 | Việc KPI bắt buộc có người nhận và kỳ ngay khi tạo | Việc được tạo **chưa giao, chưa gán kỳ** (trạng thái *Chưa giao*) |
| 4 | Việc hằng ngày và việc KPI đặt cạnh nhau, dễ hiểu nhầm cùng tính điểm | **Việc hằng ngày không tính điểm**; chỉ **việc KPI** tính điểm và chỉ quản lý trong kỳ KPI |
| 5 | "Bảng điểm KPI" chỉ xem | Đổi thành **Tự đánh giá công việc KPI**: cán bộ tự chấm theo mẫu hiện tại, thang 100 |
| 6 | Phần 70 điểm của Phiếu tự đánh giá tính riêng | Lấy **tự động** từ kết quả Tự đánh giá công việc KPI, quy về thang 70 |

---

## 2. Thứ tự bắt buộc của một chu kỳ

```
① Tạo kỳ KPI (gán đơn vị)
        ↓
② Tạo công việc (Công việc) ── có thể tạo trước, chưa giao, chưa gán kỳ
        ↓
③ Giao việc: chọn người/đơn vị nhận + kỳ KPI của đơn vị đó
        ↓
④ Thực hiện, nộp sản phẩm, duyệt (kiểm đếm số lượng, số lần sửa, số lần nhắc)
        ↓
⑤ Tự đánh giá công việc KPI (thang 100)
        ↓
⑥ Phiếu tự đánh giá, xếp loại: 30 điểm tiêu chí chung + 70 điểm nhiệm vụ (tự điền từ ⑤)
        ↓
⑦ Thẩm định → Quyết định → Công khai kết quả
```

- **[BẮT BUỘC]** Không giao được việc KPI khi đơn vị của người/đơn vị nhận **chưa có kỳ KPI đang mở** (bước ① phải có trước bước ③).
- **[BẮT BUỘC]** Không tự đánh giá được khi kỳ chưa sang giai đoạn *Đánh giá*.
- **[BẮT BUỘC]** Phiếu tự đánh giá (⑥) không gửi được khi Tự đánh giá công việc KPI (⑤) của cùng kỳ chưa hoàn tất.

---

## 3. Kỳ KPI

### 3.1. Loại kỳ

| Loại | Khoảng thời gian | Tính điểm | Ghi chú |
|---|---|---|---|
| **Tháng** | Một tháng dương lịch | KPI tháng | Theo dõi sớm |
| **Quý** | Từ ngày 15 tháng cuối quý trước đến hết ngày 14 tháng cuối quý (HD20) | KPI quý = bình quân KPI các kỳ tháng con (nếu có), nếu không thì tính trực tiếp | **Kỳ xếp loại** — sinh Phiếu tự đánh giá |
| **Năm** | 4 quý trong năm | Tổng hợp 4 kỳ quý | Xếp loại năm |

- Kỳ có quan hệ cha – con: **Năm ⊃ Quý ⊃ Tháng**. Tạo kỳ Quý thì hệ thống gợi ý gắn vào kỳ Năm cùng năm của đơn vị (nếu có).
- **[BẮT BUỘC]** Các kỳ **cùng loại** của **cùng một đơn vị** không được chồng thời gian.
- **[BẮT BUỘC]** Kỳ con phải nằm trong khoảng thời gian của kỳ cha.

### 3.2. Gán đơn vị

- Mỗi kỳ là **kỳ KPI của một đơn vị** (trường *Đơn vị áp dụng*).
- Người tạo kỳ chỉ chọn được **đơn vị cấp dưới** trong phạm vi dữ liệu của mình (không tạo kỳ cho đơn vị ngang cấp hay cấp trên).
- Khi tạo, có tùy chọn **"Áp dụng cho cả các đơn vị trực thuộc"**: hệ thống tạo một kỳ riêng cho từng đơn vị con (cùng loại, cùng thời gian), để mỗi đơn vị tự quản lý giai đoạn kỳ của mình.
- Kỳ của đơn vị cha **không** tự áp cho đơn vị con nếu không chọn tùy chọn trên.

### 3.3. Giai đoạn kỳ

`Nháp → Đã mở → Đang thực hiện → Đánh giá → Phê duyệt → Đã đóng`

| Giai đoạn | Được làm |
|---|---|
| Nháp | Sửa thông tin kỳ, xoá kỳ |
| Đã mở / Đang thực hiện | Giao việc vào kỳ, nộp và duyệt sản phẩm |
| Đánh giá | Tự đánh giá công việc KPI, lập Phiếu tự đánh giá (chỉ kỳ Quý) |
| Phê duyệt | Thẩm định, quyết định xếp loại |
| Đã đóng | Chỉ xem; không giao thêm, không sửa điểm |

- **[BẮT BUỘC]** Chỉ xoá được kỳ ở giai đoạn *Nháp* và chưa có việc nào gán vào.
- **[BẮT BUỘC]** Không chuyển giai đoạn lùi lại sau *Đánh giá* (trừ quyền Siêu quản trị, có ghi lịch sử).

### 3.4. Màn "Kỳ KPI" (mới)

- **Danh sách**: thanh công cụ chung (tìm, Lọc nâng cao theo loại kỳ / đơn vị / giai đoạn, Cột, Xuất, **Tạo kỳ**). Cột: STT, Tên kỳ, Loại, Đơn vị, Từ ngày – Đến ngày, Kỳ cha, Giai đoạn, Số việc KPI, Thao tác.
- **Tạo kỳ**: Loại (Tháng / Quý / Năm) → chọn tháng/quý/năm (hệ thống tự điền ngày theo quy tắc mục 3.1, cho sửa nếu cần), Đơn vị áp dụng, Kỳ cha, tùy chọn áp dụng cho đơn vị trực thuộc, Tên kỳ (tự sinh, vd. *Quý IV/2026 – Phòng Tham mưu*).
- **Chi tiết kỳ**: thông tin kỳ, nút chuyển giai đoạn, danh sách việc KPI trong kỳ, tiến độ tự đánh giá của cán bộ.

---

## 4. Công việc (tạo việc)

Màn **"Giao việc" hiện tại đổi thành "Công việc"** — nơi tạo và quản lý kho việc, chưa giao.

### 4.1. Hai loại việc

| | Việc KPI | Việc hằng ngày |
|---|---|---|
| Tính điểm | **Có** — vào KPI và phần 70 điểm | **Không** |
| Gắn kỳ KPI | Có (khi giao) | Không |
| Nguồn | Theo **Danh mục nhiệm vụ** (TM-xx) hoặc **phát sinh** (PS-xx) | Tự do |
| Thông tin | Mã, tên, đơn vị tính, điểm M, số lượng, hạn, trường riêng của danh mục, căn cứ (bắt buộc với việc phát sinh) | Tên, mô tả, hạn, người chủ trì, người phối hợp |
| Theo dõi | Số sản phẩm duyệt, số lần sửa, số lần nhắc | Bảng trạng thái (Cần làm → Đang làm → Chờ duyệt → Hoàn thành) |

- **[BẮT BUỘC]** Việc hằng ngày **không bao giờ** xuất hiện trong Tự đánh giá công việc KPI hay Phiếu tự đánh giá.
- **[BẮT BUỘC]** Không chuyển đổi loại việc sau khi tạo (việc hằng ngày ↔ việc KPI). Muốn tính điểm thì tạo việc KPI mới.

### 4.2. Trạng thái việc KPI

`Chưa giao → Đã giao → Đang thực hiện → Đã báo cáo` (và `Đã thu hồi`)

- **Chưa giao**: việc vừa tạo, **không có người nhận, không có kỳ**. Không tính điểm, không hiện với cán bộ.
- Việc *Chưa giao* sửa / xoá tự do.
- Việc đã giao: chỉ sửa được hạn và trường riêng; điểm M giữ theo phiên bản danh mục lúc giao.

### 4.3. Màn "Công việc"

- 2 tab: **Việc KPI** · **Việc hằng ngày**.
- Tab Việc KPI có bộ lọc nhanh **Chưa giao / Đã giao / Tất cả**, cột *Người nhận* và *Kỳ* hiển thị "Chưa giao" / "Chưa gán kỳ".
- Nút **Tạo việc KPI**: chọn từ danh mục hoặc phát sinh; **không** có trường người nhận và kỳ.
- Từ một hoặc nhiều việc *Chưa giao*, bấm **Giao việc** để chuyển sang màn Giao việc với các việc đã chọn.
- Việc hằng ngày tạo và giao ngay trong một bước như hiện tại (không cần kỳ).

---

## 5. Giao việc

Màn **"Giao việc"** (mới) chỉ làm một việc: gán việc KPI đã tạo cho người/đơn vị trong một kỳ.

- Chọn **kỳ KPI** trước (chỉ các kỳ *Đã mở* / *Đang thực hiện* trong phạm vi của người giao) → danh sách bên dưới là các việc trong kỳ đó + nút **Thêm việc vào kỳ** (chọn từ việc *Chưa giao*).
- Mỗi việc chọn **người nhận** (cá nhân → tính KPI cá nhân, hoặc đơn vị → tính KPI tập thể), người phối hợp, người theo dõi.
- **[BẮT BUỘC]** Người/đơn vị nhận phải thuộc **đơn vị của kỳ** hoặc đơn vị trực thuộc mà kỳ đã áp dụng.
- **[BẮT BUỘC]** Hạn của việc phải nằm trong thời gian kỳ (hoặc ghi rõ *việc trải nhiều kỳ* — tính vào kỳ hoàn thành, theo HD20).
- Giao việc cho **kỳ Quý** hoặc **kỳ Tháng**; không giao trực tiếp vào kỳ Năm (kỳ Năm chỉ tổng hợp).
- Thu hồi việc: trả về *Chưa giao* (giữ lịch sử) thay vì xoá.
- Chuyển việc sang kỳ khác: chỉ khi kỳ hiện tại chưa sang *Đánh giá*.

---

## 6. Tự đánh giá công việc KPI (thay "Bảng điểm KPI")

### 6.1. Phạm vi

- Mỗi cán bộ (và mỗi tập thể) có **một bản tự đánh giá cho mỗi kỳ** có việc KPI được giao.
- Danh sách dòng = **các việc KPI đã giao cho người đó trong kỳ** (không có việc hằng ngày, không có việc *Chưa giao*).

### 6.2. Biểu mẫu

Giữ **đúng biểu mẫu Bảng điểm KPI hiện tại theo từng vai trò** (mẫu tập thể · mẫu lãnh đạo, chỉ huy · mẫu cá nhân), chuyển từ chỉ xem sang **nhập được**:

| Cột | Ai điền | Ghi chú |
|---|---|---|
| M (điểm nhiệm vụ) | Hệ thống | Từ việc đã giao, không sửa |
| Số lượng giao / hoàn thành → A | Hệ thống gợi ý từ số sản phẩm đã duyệt | Cán bộ xác nhận |
| Mức chất lượng → B | Cán bộ tự chọn mức | Gợi ý theo số lần phải sửa (HD20 mục 6.2) |
| Mức tiến độ → C | Cán bộ tự chọn mức | Gợi ý theo số lần bị nhắc (HD20 mục 6.3) |
| D (tỷ lệ cấp dưới hoàn thành) | Hệ thống | Chỉ mẫu LĐCH |
| Giải trình | Cán bộ | **Bắt buộc** khi chọn mức khác mức gợi ý hoặc mức vượt (>100%) |

- Kết quả: **KPI theo thang 100** (công thức HD20, làm tròn 3 chữ số thập phân).
- **[BẮT BUỘC]** Mức vượt (101–120%) không áp dụng cho Nhóm 1, và tiến độ vượt chỉ khi thời hạn ≥ 15 ngày, hoàn thành ≤ 2/3 thời gian.
- **[BẮT BUỘC]** KPI người đứng đầu không vượt KPI tập thể mình phụ trách — hệ thống tự giới hạn và ghi chú.
- Nút **Lưu nháp** và **Hoàn tất tự đánh giá**. Sau khi hoàn tất thì khoá; muốn sửa phải được cấp trên trả lại.
- Vẫn giữ **In / Xuất** đúng mẫu.

---

## 7. Đưa kết quả vào Phiếu tự đánh giá (phần 70 điểm)

Khi cán bộ bấm **Hoàn tất tự đánh giá** ở kỳ **Quý**, hệ thống điền **Nhóm tiêu chí về kết quả thực hiện nhiệm vụ (70 điểm)** trong Phiếu tự đánh giá cùng kỳ:

Với từng việc n trong bản tự đánh giá:

- **Hiệu suất_n** = (Bn + Cn) / (Mn × 2)
- **Điểm tối đa_n** = Mn × 70 / ΣM (cân đối làm tròn để tổng đúng 70)
- **Điểm đạt_n** = Điểm tối đa_n × Hiệu suất_n
- **Tổng nhóm nhiệm vụ** = Σ Điểm đạt_n ≈ **KPI (thang 100) × 0,7**

Quy tắc:

- **[BẮT BUỘC]** Phần 70 điểm trên phiếu **chỉ đọc**, không nhập tay; muốn đổi phải sửa ở Tự đánh giá công việc KPI.
- Mỗi dòng nhiệm vụ trên phiếu có liên kết mở lại dòng tương ứng ở bản tự đánh giá.
- Việc chưa hoàn thành (A < M) được ghi chú tự động vào phiếu.
- Nếu bản tự đánh giá bị trả lại để sửa, phần 70 điểm trên phiếu chuyển về *Chưa có số liệu* và phiếu không gửi được cho tới khi hoàn tất lại.
- Kỳ **Tháng**: chỉ có bản tự đánh giá (KPI tháng), **không** sinh phiếu. KPI quý = bình quân KPI các tháng nếu đơn vị dùng kỳ tháng.
- Tổng điểm phiếu = **30 điểm tiêu chí chung** (cán bộ tự chấm như hiện tại) + **70 điểm nhiệm vụ** (mục này) → phân nhóm theo HD20 mục 6.5.

---

## 8. Cấu trúc chức năng sau thay đổi

| Nhóm | Màn | Thay đổi |
|---|---|---|
| Công việc | **Kỳ KPI** | Mới |
| Công việc | **Công việc** | Đổi từ "Giao việc"; chỉ tạo việc |
| Công việc | **Giao việc** | Mới; gán việc vào kỳ + người nhận |
| Công việc | Theo dõi tiến độ | Giữ |
| Đánh giá KPI | **Tự đánh giá công việc KPI** | Đổi từ "Bảng điểm KPI"; nhập được |
| Đánh giá KPI | Phiếu tự đánh giá | Phần 70 điểm lấy từ màn trên |
| Đánh giá KPI | Phiếu cấp dưới, Công khai kết quả | Giữ |

Quyền mới: `ky-kpi` (Kỳ KPI: Xem / Thêm, sửa / Xoá), tách `giao-viec` thành `cong-viec` và `giao-viec`; `bang-diem` đổi thành `tu-danh-gia-kpi`.

---

## 9. Vấn đề cần xác nhận

1. **Kỳ của đơn vị cấp trên** có được dùng cho cán bộ của đơn vị cấp dưới không, hay mỗi đơn vị bắt buộc có kỳ riêng? (Tài liệu đang giả định: bắt buộc kỳ riêng, tạo nhanh bằng tùy chọn "Áp dụng cho các đơn vị trực thuộc".)
2. Cán bộ **tự chọn** mức chất lượng / tiến độ hay hệ thống **khoá theo số lần sửa / nhắc** và cán bộ chỉ giải trình?
3. Sau khi cán bộ hoàn tất tự đánh giá, chỉ huy có **chấm lại** từng việc ở màn này không, hay chỉ điều chỉnh khi thẩm định phiếu?
4. Kỳ Năm: có cần bản tự đánh giá riêng, hay chỉ tổng hợp từ 4 quý?
