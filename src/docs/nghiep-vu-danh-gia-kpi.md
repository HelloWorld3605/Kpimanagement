# Tài liệu nghiệp vụ — Hệ thống đánh giá, xếp loại theo KPI

> Phiên bản: 0.1 (bản nháp đầu tiên) · Ngày lập: 22/10/2026
> Phạm vi áp dụng dự kiến: Bộ Tư lệnh Cảnh sát cơ động (K02) và các đơn vị trực thuộc
> Áp dụng từ: Quý III/2026

---

## 0. Căn cứ

| Ký hiệu | Văn bản | Nội dung sử dụng |
|---|---|---|
| HD20 | Hướng dẫn 20-HD/ĐUCA | Phương pháp tính KPI, tiêu chí chung 30 điểm, phân nhóm cán bộ |
| CV881 | Công văn 881 | Đánh giá cán bộ không giữ chức vụ, xử lý đơn vị chậm nộp |
| HD02 | Hướng dẫn 02-HD/BTCTW | Quy trình đánh giá, xếp loại hằng quý, các trường hợp chưa đánh giá |
| CV214 | Công văn 214 của Đảng ủy K02 | Thẩm quyền, mốc thời gian, nơi nộp hồ sơ |
| CĐKPI | Biểu mẫu Bảng chấm điểm KPI | Bảng điểm KPI cá nhân / tập thể |
| KĐLĐCH-1 | Biểu mẫu Phiếu tự đánh giá, xếp loại | Phiếu xếp loại quý (30 + 70 điểm) |
| PL-QĐ | Phụ lục quy đổi | Quy đổi KPI sang phần 70 điểm |

---

## 1. Tổng quan nghiệp vụ

Hệ thống số hoá toàn bộ vòng đời đánh giá cán bộ, tập thể theo KPI:

1. **Giao và kiểm đếm nhiệm vụ** liên tục trong kỳ.
2. **Tính điểm KPI** tự động từ dữ liệu kiểm đếm.
3. **Tự đánh giá, xếp loại** hằng quý trên Phiếu KĐLĐCH-1.
4. **Thẩm định, quyết định** theo phân cấp thẩm quyền.
5. **Thông báo, lưu trữ, tổng hợp** phục vụ phân nhóm cán bộ và xếp loại năm.

### 1.1. Nguyên tắc cốt lõi

- **KPI là kết quả kiểm đếm, không phải tự khai.** Mỗi nhiệm vụ được giao kèm điểm; khi hoàn thành ghi nhận số lần sửa và số lần bị nhắc tiến độ. Cuối kỳ hệ thống tự tổng hợp.
- **Cán bộ không tự tạo phiếu.** Bảng điểm KPI và Phiếu tự đánh giá do hệ thống sinh khi chốt kỳ, chọn đúng mẫu theo chức vụ.
- **Không có trạng thái "trả lại".** Người thẩm định chấm lại trực tiếp từng dòng và ghi lý do.
- **Đánh giá từ dưới lên.** Kết quả cấp dưới là đầu vào bắt buộc để tính kết quả cấp trên.
- **Phân quyền theo vị trí trên cây tổ chức**, không theo role gán cứng.

### 1.2. Hai loại phiếu

| | Bảng điểm KPI (CĐKPI) | Phiếu tự đánh giá, xếp loại (KĐLĐCH-1) |
|---|---|---|
| Mục đích | Đo số lượng, chất lượng, tiến độ (và tỷ lệ cấp dưới hoàn thành với LĐCH) | Xếp loại quý theo 4 mức |
| Nguồn | Nhiệm vụ được giao + kết quả kiểm đếm | 30 điểm tiêu chí chung + 70 điểm quy đổi từ KPI |
| Kỳ | Tháng; quý = bình quân các tháng | Quý; làm căn cứ xếp loại năm |

---

## 2. Đối tượng đánh giá

### 2.1. Tập thể
- Bộ Tư lệnh (tập thể BTL)
- Cấp phòng: Phòng, Ban, Đội, Tiểu đoàn, Bệnh xá và tương đương
- Đại đội, Trung đội
- Tiểu đội (có chỉ huy)

### 2.2. Cá nhân
| Nhóm | Phạm vi | Mẫu tiêu chí chung |
|---|---|---|
| Lãnh đạo, chỉ huy (LĐCH) | Từ cấp Tiểu đội trở lên | Bộ LĐCH |
| Cán bộ, chiến sĩ không giữ chức vụ | Còn lại | Bộ không LĐCH |

---

## 3. Vai trò người dùng

Quyền được **suy ra từ chức vụ và vị trí trên cây tổ chức**. Một người có thể đồng thời giữ nhiều vai trò (ví dụ chỉ huy vừa được đánh giá vừa xác nhận cho cấp dưới).

| Vai trò | Trách nhiệm |
|---|---|
| **Cán bộ, chiến sĩ** | Nhận việc, nộp sản phẩm, rà soát Bảng điểm KPI, chấm 30 điểm tiêu chí chung, giải trình, đề xuất xếp loại, gửi phiếu |
| **Lãnh đạo, chỉ huy** | Là người được đánh giá (mẫu LĐCH, có chỉ số D); giao việc, duyệt sản phẩm, ghi nhận sửa/nhắc cho cấp dưới; xác nhận phiếu cấp dưới theo mục 3.1 |
| **Cấp có thẩm quyền** | Quyết định điểm KPI và mức xếp loại theo mục 3.2 |
| **Cơ quan tham mưu** (P. Tham mưu tác chiến) | Xây dựng khung Danh mục nhiệm vụ; giao chỉ tiêu; kiểm đếm, thẩm định KPI tập thể |
| **Cơ quan tổ chức cán bộ** (P. TCCB) | Quản lý tiêu chí chung, kỳ đánh giá; thẩm định KPI cá nhân; đề xuất xếp loại; thông báo, lưu trữ, báo cáo |
| **Cơ quan phối hợp** (chính trị, thanh tra, UBKT) | Cho ý kiến trong bước thẩm định; không chấm điểm |
| **Cơ quan thường trực (CQTT)** | Quyết định KPI cán bộ không giữ chức vụ tại CQTT, gửi kết quả về phòng chủ quản |
| **Quản trị hệ thống** | Người dùng, phân quyền, cây tổ chức, nhật ký |

### 3.1. Người xác nhận phiếu (chú thích mẫu KĐLĐCH-1)

| Người được đánh giá | Người xác nhận |
|---|---|
| CBCS không chức vụ thuộc đội/đại đội | Chỉ huy cấp Đội (Đại đội trưởng với E11, E12) |
| CBCS không chức vụ thuộc phòng | Lãnh đạo phòng phụ trách |
| CBCS không chức vụ tại CQTT | Thủ trưởng CQTT |
| Chỉ huy từ Tiểu đoàn trở xuống | Tiểu đoàn trưởng (Đại đội trưởng với E11, E12) |
| Lãnh đạo cấp phòng | Trưởng phòng / Trung đoàn trưởng |
| Người được đánh giá là cấp trưởng | Cấp phó ký xác nhận |

### 3.2. Thẩm quyền quyết định

| Đối tượng | Cấp quyết định |
|---|---|
| Tập thể BTL, lãnh đạo BTL | BTL tự tính hằng tháng |
| Tập thể cấp phòng, LĐCH cấp phòng | Ban Thường vụ / Lãnh đạo BTL |
| Tập thể cấp đội trở xuống, chỉ huy cấp đội trở xuống, CB không chức vụ | Cấp phòng (trừ CQTT) |
| CB không chức vụ tại CQTT | CQTT, gửi về phòng chủ quản |
| Cán bộ trưng tập | Đơn vị nơi trưng tập xác nhận kết quả, đơn vị quản lý chấm điểm |

---

## 4. Kỳ đánh giá

| Kỳ | Phạm vi | Vai trò |
|---|---|---|
| Tháng | Kiểm đếm và tính KPI tháng | Theo dõi sớm |
| Quý | Từ **ngày 15 tháng cuối quý trước** đến **hết ngày 14 tháng cuối quý** | KPI quý = bình quân KPI các tháng; xếp loại quý |
| Năm | Tổng hợp 4 quý | Xếp loại năm |

### 4.1. Mốc nộp hồ sơ (CV214)
- Đơn vị nộp kết quả **trước ngày 10 tháng cuối quý**:
  - Hồ sơ tập thể → P. Tham mưu tác chiến
  - Hồ sơ LĐCH cấp phòng → P. TCCB
- Báo cáo xếp loại LĐCH: trước 10/3, 10/6, 10/9.
- Đơn vị chậm nộp: hệ thống cảnh báo, ghi nhận nộp muộn; cấp có thẩm quyền xem xét hạ mức xếp loại lãnh đạo đơn vị (CV881). **Hệ thống không tự gửi phiếu thay cán bộ.**

> ⚠️ Mâu thuẫn mốc ngày 10 (nộp) và ngày 14 (chốt kiểm đếm) — xem mục 12.

### 4.2. Trường hợp chưa đánh giá trong quý (chuyển sang quý sau)
- Đi đào tạo, bồi dưỡng từ 2 tháng trở lên
- Mới bổ nhiệm dưới 1 tháng
- Nghỉ ốm, thai sản từ 2 tháng trở lên
- Đang bị kiểm tra khi có dấu hiệu vi phạm

---

## 5. Danh mục nhiệm vụ

- Do **P. Tham mưu tác chiến** xây dựng khung; đơn vị cụ thể hoá danh mục của mình.
- Mỗi nhiệm vụ có điểm theo **thang 100**, chia 3 nhóm:

| Nhóm | Khoảng điểm | Ý nghĩa |
|---|---|---|
| Nhóm 1 | 0 – dưới 50 | Nhiệm vụ đơn giản, thường xuyên |
| Nhóm 2 | 50 – dưới 70 | Nhiệm vụ trung bình |
| Nhóm 3 | 70 – 100 | Nhiệm vụ phức tạp, then chốt |

- **Nhiệm vụ phát sinh** ngoài danh mục: lãnh đạo giao việc tự xác định nhóm và điểm; bổ sung vào danh mục tại kỳ rà soát.
- **Nhiệm vụ trải nhiều quý**: tính vào quý hoàn thành, hoặc theo bảng tiến độ đã được phê duyệt.
- Danh mục có **phiên bản**; phiếu của một kỳ luôn gắn với phiên bản danh mục có hiệu lực của kỳ đó.

---

## 6. Phương pháp tính KPI (HD20)

### 6.1. Ký hiệu
- **M** — điểm của nhiệm vụ theo danh mục
- **A** — điểm số lượng (M nếu hoàn thành, 0 nếu không)
- **B** — điểm chất lượng = M × mức chất lượng
- **C** — điểm tiến độ = M × mức tiến độ
- **D** — tỷ lệ cấp dưới hoàn thành nhiệm vụ (chỉ áp dụng LĐCH)

### 6.2. Mức chất lượng (theo số lần phải sửa)

| Kết quả | Mức |
|---|---|
| Vượt mức (không áp dụng Nhóm 1) | 101% – 120% |
| Đạt, không phải sửa | 100% |
| Sửa 1 lần | 75% |
| Sửa 2–4 lần | 50% |
| Sửa 5–6 lần | 25% |
| Sửa từ 7 lần | 0% |

### 6.3. Mức tiến độ (theo số lần bị nhắc)

| Kết quả | Mức |
|---|---|
| Vượt tiến độ (*) | 101% – 120% |
| Đúng hạn | 100% |
| Nhắc 1 lần | 75% |
| Nhắc 2 lần | 50% |
| Nhắc 3 lần | 25% |
| Nhắc từ 4 lần | 0% |

(*) Chỉ áp dụng khi: không thuộc Nhóm 1, thời hạn ≥ 15 ngày, hoàn thành trong ≤ 2/3 thời gian.

### 6.4. Công thức
- **Chỉ số KPI (thang 100):** KPI_CN = (A + B + C) / 3 × 100 · KPI_LĐ = (A + B + C + D) / 4 × 100.
- **Phần nhiệm vụ chính thức (thang 70)** = KPI × 0,7. Tổng điểm = E (≤ 30) + KPI × 0,7.
- (B + C) / (2M) là **hiệu suất theo nhiệm vụ** — phương pháp gợi ý phân bổ ở mục 8, không phải KPI.
- Kỳ tháng, quý, năm chấm **độc lập**: KPI quý / năm không lấy bình quân, không cộng dồn từ kỳ khác.
- Kỳ kiểm đếm theo K02: tháng 15 → 14; quý kết thúc ngày 14 tháng cuối quý. Hạn gửi tự đánh giá cấu hình theo loại hồ sơ / đối tượng, "Cần xác nhận nghiệp vụ" khi chưa có căn cứ, không tự suy diễn; mọi thay đổi lưu người, thời điểm, căn cứ.
- Chỉ số số lượng = ΣA / ΣM
- Chỉ số chất lượng = ΣB / ΣM
- Chỉ số tiến độ = ΣC / ΣM
- D = số cấp dưới hoàn thành nhiệm vụ / tổng số cấp dưới
- Tất cả chỉ số làm tròn **3 chữ số thập phân**.
- **Hoàn thành nhiệm vụ** (dùng tính D) = KPI ≥ 50 **và** hoàn thành 100% số nhiệm vụ.
- KPI người đứng đầu **không được cao hơn** KPI tập thể do mình phụ trách.
- Cấp phó: D tính theo lĩnh vực / đơn vị được phân công phụ trách.

### 6.5. Phân nhóm cán bộ
- Tổng điểm = Tiêu chí chung (30) + KPI × 0,7
- ≥ 70: Nhóm 1 · 50 – dưới 70: Nhóm 2 · dưới 50: Nhóm 3

---

## 7. Tiêu chí chung (30 điểm)

| Bộ | Áp dụng | Cơ cấu |
|---|---|---|
| Tập thể | Mọi tập thể | 6 tiêu chí × 5 điểm |
| LĐCH | Lãnh đạo, chỉ huy | 18 / 4 / 8 |
| Không LĐCH | CBCS không giữ chức vụ | 20 / 8 / 2 |

- Do P. TCCB quản lý, có phiên bản và quy trình ban hành.
- Mỗi kỳ dùng phiên bản đã ban hành có hiệu lực tại thời điểm mở kỳ.

---

## 8. Quy đổi KPI sang phần 70 điểm (PL-QĐ)

Với từng nhiệm vụ n trong kỳ:
- **Hiệu suất_n** = (Bn + Cn) / (Mn × 2)
- **Điểm tối đa_n** = Mn × 70 / ΣM, làm tròn số nguyên; cân đối để tổng đúng 70
- **Điểm đạt_n** = Điểm tối đa_n × Hiệu suất_n
- Nếu An < Mn (chưa hoàn thành): ghi chú tự động vào phiếu.

Phần 70 điểm trên Phiếu KĐLĐCH-1 **chỉ hiển thị, không cho nhập tay**.

---

## 9. Quy trình nghiệp vụ một kỳ quý

```
Mở kỳ → Kiểm đếm trong kỳ → KPI tháng → Chốt kỳ (sinh phiếu)
      → Tự đánh giá → Thẩm định (dưới lên) → Quyết định → Thông báo, lưu trữ
```

### Bước 1 — Mở kỳ
- P. TCCB tạo kỳ quý: mốc bắt đầu/kết thúc kiểm đếm, hạn nộp, phiên bản danh mục và tiêu chí áp dụng.
- Cấp trên giao chỉ tiêu cho tập thể; nhiệm vụ lấy điểm theo danh mục.

### Bước 2 — Kiểm đếm trong kỳ
- Chỉ huy giao việc cho cá nhân/tập thể (từ danh mục hoặc phát sinh).
- Cán bộ nộp sản phẩm.
- Chỉ huy duyệt:
  - **Đạt** → 100%
  - **Vượt mức / vượt tiến độ** → hệ thống kiểm tra điều kiện mục 6.3
  - **Yêu cầu sửa** → tăng bộ đếm số lần sửa
  - **Nhắc tiến độ** → tăng bộ đếm số lần nhắc
- Mọi thao tác ghi nhật ký (ai, khi nào, lý do).

### Bước 3 — KPI tháng
- Cuối mỗi tháng hệ thống tính KPI tháng tạm thời.
- Cảnh báo sớm cho chỉ huy: cán bộ có KPI < 50 hoặc có nhiệm vụ quá hạn.

### Bước 4 — Chốt kỳ (ngày 14 tháng cuối quý)
- Khoá kiểm đếm.
- Hệ thống sinh cho từng đối tượng:
  - Bảng điểm KPI (CĐKPI)
  - Phiếu KĐLĐCH-1 với phần 70 điểm đã quy đổi và đúng bộ tiêu chí chung theo chức vụ
- Đối tượng thuộc mục 4.2 được đánh dấu "Chuyển quý sau", không sinh phiếu.

### Bước 5 — Tự đánh giá
- Cán bộ/đại diện tập thể:
  - Rà soát Bảng điểm KPI
  - Chấm 30 điểm tiêu chí chung
  - Giải trình nhiệm vụ chưa hoàn thành, lý do bất khả kháng (đính kèm minh chứng)
  - Đề xuất mức xếp loại
- Gửi phiếu → trạng thái **Đã gửi**.

### Bước 6 — Thẩm định (bắt buộc từ dưới lên)
- Thứ tự phụ thuộc:
  1. Tập thể và cá nhân cấp dưới phải có kết quả trước (đầu vào của D).
  2. KPI tập thể phải có trước KPI người đứng đầu (ràng buộc mục 6.4, quy tắc 70% mục 10).
- Phân công:
  - KPI tập thể → Cơ quan tham mưu
  - KPI cá nhân → P. TCCB
  - Cơ quan phối hợp → cho ý kiến
- Người thẩm định chấm lại từng dòng kèm lý do. Hệ thống tự sinh nhận xét:
  - "Thống nhất với kết quả tự đánh giá…" nếu không điều chỉnh
  - Liệt kê các nhiệm vụ/tiêu chí có điểm khác nếu có điều chỉnh
- Kết thúc → trạng thái **Chờ quyết định**, kèm mức xếp loại đề xuất.

### Bước 7 — Quyết định
- Cấp có thẩm quyền (mục 3.2) chốt:
  - Mức xếp loại: Hoàn thành xuất sắc / Hoàn thành tốt / Hoàn thành / Không hoàn thành nhiệm vụ
  - Mức độ đáp ứng nhiệm vụ then chốt (3 mức)
- Hệ thống kiểm tra tỷ lệ Hoàn thành xuất sắc theo quy định (làm tròn) và các quy tắc mục 10.
- Trạng thái **Đã quyết định**, phiếu bị khoá.

### Bước 8 — Thông báo, lưu trữ
- Công khai kết quả theo phạm vi đơn vị.
- Cập nhật phân nhóm cán bộ, dữ liệu xếp loại năm.
- Xuất biểu mẫu (PDF/DOCX) đúng mẫu ban hành.

---

## 10. Quy tắc kiểm tra tự động

| Mã | Quy tắc | Xử lý |
|---|---|---|
| R01 | Cá nhân hoàn thành < 100% nhiệm vụ | Cảnh báo "Không hoàn thành nhiệm vụ", trừ khi bất khả kháng được xác nhận |
| R02 | Tập thể đạt < 70% | Người đứng đầu: Không hoàn thành nhiệm vụ; cấp phó: không được Hoàn thành xuất sắc |
| R03 | KPI người đứng đầu > KPI tập thể | Chặn, yêu cầu điều chỉnh |
| R04 | Vượt mức với nhiệm vụ Nhóm 1 | Chặn |
| R05 | Vượt tiến độ không đủ điều kiện (≥15 ngày, ≤2/3 thời gian) | Chặn |
| R06 | Thẩm định cấp trên khi cấp dưới chưa có kết quả | Chặn |
| R07 | Vượt tỷ lệ Hoàn thành xuất sắc | Cảnh báo cho cấp quyết định |
| R08 | Năm có 1 quý Không hoàn thành | Không được Hoàn thành xuất sắc năm |
| R09 | 2 quý liên tiếp Không hoàn thành | Gắn cờ "Đề xuất thay thế" |
| R10 | Đơn vị quá hạn nộp | Cảnh báo, ghi nhận nộp muộn |

> Hệ thống **không tự xếp loại theo ngưỡng điểm**. Văn bản không quy định ngưỡng điểm → mức xếp loại; xếp loại do cấp thẩm quyền quyết định, hệ thống chỉ gợi ý và cảnh báo.

---

## 11. Trạng thái phiếu

| Trạng thái | Ai thao tác | Mô tả |
|---|---|---|
| Nháp | Hệ thống sinh, cán bộ chỉnh | Chấm tiêu chí chung, giải trình |
| Đã gửi | Cán bộ | Không sửa được nữa |
| Đang thẩm định | Cơ quan tham mưu / TCCB | Chấm lại từng dòng, có lý do |
| Chờ quyết định | Cấp thẩm quyền | Có mức đề xuất |
| Đã quyết định | — | Khoá, công khai, lưu trữ |
| Chuyển quý sau | Hệ thống / TCCB | Thuộc mục 4.2 |

Không có trạng thái "Trả lại".

---

## 12. Cấu trúc chức năng (sidebar)

| Nhóm | Màn hình | Người dùng chính |
|---|---|---|
| Tổng quan | Việc của tôi, hạn nộp, tình trạng đơn vị (theo vai trò) | Tất cả |
| Công việc | Nhiệm vụ của tôi · Giao việc · Duyệt sản phẩm | Cán bộ, chỉ huy |
| Đánh giá KPI | Bảng điểm KPI · Tự đánh giá, xếp loại · Thẩm định · Quyết định xếp loại | Cán bộ / Tham mưu, TCCB / Thẩm quyền |
| Kết quả & báo cáo | Kết quả xếp loại · Phân nhóm cán bộ · Theo dõi tiến độ nộp · Báo cáo đề nghị · Xếp loại năm | TCCB, lãnh đạo |
| Danh mục | Danh mục nhiệm vụ · Danh mục tiêu chí (3 bộ) · Quy tắc tính điểm | Tham mưu, TCCB |
| Kỳ đánh giá | Kỳ tháng/quý/năm · Trường hợp chưa đánh giá | TCCB |
| Tổ chức | Cơ cấu tổ chức (kèm người xác nhận) · Cán bộ · Phân công phụ trách · Trưng tập | TCCB, quản trị |
| Quản trị hệ thống | Người dùng & phân quyền · Nhật ký | Quản trị |

---

## 13. Điểm lệch so với bản thiết kế hiện tại

| # | Hiện tại | Theo văn bản | Hướng xử lý |
|---|---|---|---|
| 1 | Nhóm điểm danh mục ≤30 / ≤60 | Dưới 50 / 50–dưới 70 / 70–100 | Sửa ngưỡng |
| 2 | Phần 70 điểm nhập % thủ công | Quy đổi tự động từ KPI (mục 8) | Chuyển sang chỉ đọc |
| 3 | Xếp loại theo ngưỡng ≥90/70/50 | Không có trong văn bản | Bỏ, thay bằng cảnh báo quy tắc |
| 4 | Tự gửi phiếu khi hết hạn | Không có; chỉ xử lý đơn vị chậm nộp | Thay bằng cảnh báo quá hạn |
| 5 | Bộ tiêu chí mẫu rút gọn | 3 bộ đầy đủ (mục 7) | Bổ sung |
| 6 | Thẩm định 1 bước | Đề xuất (TCCB) + quyết định (thẩm quyền) | Tách 2 bước |
| 7 | Kỳ theo tháng dương lịch | Ngày 15 → ngày 14 | Sửa mốc kỳ |

---

## 14. Vấn đề cần xác nhận

| # | Câu hỏi | Giả định tạm thời |
|---|---|---|
| Q1 | Phạm vi triển khai: chỉ Bộ Tư lệnh CSCĐ? Từ cấp nào đến cấp nào? | Toàn bộ BTL đến cấp Tiểu đội |
| Q2 | Hạn nộp ngày 10 vs chốt kiểm đếm ngày 14 | Nộp ngày 10 theo số liệu tạm; cho bổ sung kết quả ngày 10–14 trước khi quyết định |
| Q3 | Có triển khai phân hệ "Công việc" (giao/duyệt hằng ngày)? | Có; nếu không, kết quả kiểm đếm nhập tay cuối kỳ |
| Q4 | CBCS không giữ chức vụ dùng mẫu xếp loại quý nào? | Dùng KĐLĐCH-1 với bộ tiêu chí không LĐCH, bỏ chỉ số D |
| Q5 | Tỷ lệ Hoàn thành xuất sắc cụ thể là bao nhiêu? | Cấu hình được trong Quy tắc tính điểm |
| Q6 | Biên độ 101–120% khi vượt mức/vượt tiến độ do ai quyết định? | Người duyệt chọn, có lý do bắt buộc |

---

## 15. Thuật ngữ

| Thuật ngữ | Giải nghĩa |
|---|---|
| KPI | Chỉ số đánh giá kết quả thực hiện nhiệm vụ |
| LĐCH | Lãnh đạo, chỉ huy |
| CBCS | Cán bộ, chiến sĩ |
| HTXS / HTT / HT / KHT | Hoàn thành xuất sắc / tốt / hoàn thành / không hoàn thành nhiệm vụ |
| CQTT | Cơ quan thường trực |
| TCCB | Tổ chức cán bộ |
| Kiểm đếm | Ghi nhận kết quả thực hiện từng nhiệm vụ (hoàn thành, số lần sửa, số lần nhắc) |
