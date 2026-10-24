# Rà soát nghiệp vụ · UI/UX · role — đối chiếu CV 214 (K02), HD 20, CV 881, biểu mẫu và tài liệu luồng màn

Ngày: 24/10/2026 · Phạm vi: role Cán bộ không giữ chức vụ (CB), role Lãnh đạo phòng (LĐP)
Nguồn đã đọc: `214_-CV_ĐU/*` (CV 214 signed, HD 20, CV 881, PDF biểu mẫu, 3a/3b/3c, KĐLĐCH‑1, Mẫu kiểm điểm V1, Phụ lục quy đổi + xlsx), `Role cán bộ … .docx` (text + 11 ảnh), code `src/`, docs `src/docs/*.md`.

> Ghi chú: file docx có tiêu đề "role lãnh đạo phòng" nhưng **chỉ mô tả role cán bộ không giữ chức vụ**. LĐP được rà soát theo văn bản, không theo màn mẫu.
> Ảnh trong docx là màn của hệ thống khác (Sở Nội vụ Thái Nguyên) dùng làm mẫu UX.

---

## 1. Đã đúng với văn bản

| Hạng mục | Căn cứ | Code |
|---|---|---|
| A, B, C, D; KPI CN = (A+B+C)/3×100, LĐCH = (A+B+C+D)/4×100 | HD 20 mục 3; CV 214 I.5 | `utils/kpi.ts` |
| Làm tròn A–D 3 chữ số | CV 214 I.5.6 | `store3` |
| Bậc chất lượng 120/100/75/50/25/0, tiến độ 120/100/75/50/25/0 | HD 20 | `qualityLevels`, `progressLevels` |
| Không vượt mức/vượt tiến độ cho Nhóm 1 (<50); vượt tiến độ ≥15 ngày, ≤2/3 thời gian | CV 214 I.5.5 | `levelsFor`, `overScheduleEligibility` |
| D: KPI ≥50 **và** 100% nhiệm vụ (trừ bất khả kháng) | CV 214 I.5.4 | `dIndex` |
| 70 điểm = KPI × 0,7; tổng G/H = E + KPI×0,7 | HD 20 mục 5.3 | `tasksKpi`, `totalScore` |
| Bộ tiêu chí chung LĐCH 18/4/8, không LĐCH 20/8/2 | HD 20 phụ lục II, III | `criteriaLabel` |
| <100% nhiệm vụ → khoá "Không hoàn thành", trừ lý do khách quan | CV 214 II.1.2, CV 881 | `rankLockedToFail` |
| Kỳ 15 → 14 | CV 214 I.2 | — |
| Popup "Xem nhiệm vụ" ở nhóm 70 điểm, đúng cấu trúc mẫu CĐKPI theo vai trò, cột nhập có viền, cột tự tính chỉ đọc | Docx (ảnh 7, 10, 2) | `TaskReviewDialog`, `reviewKind` |

---

## 2. Sai lệch nghiệp vụ

| # | Mức | Vấn đề | Căn cứ | Vị trí | Đề xuất |
|---|---|---|---|---|---|
| N1 | Cao | Gợi ý xếp loại theo ngưỡng 90/70/50 (`rankFromScore`, `suggestRank`; vạch 90·70·50 ở Dashboard). Không văn bản nào quy định ngưỡng điểm → mức xếp loại. HD 20 chỉ có 70/50 để **phân nhóm cán bộ**. `van-ban-kpi/README.md` ghi "Xếp loại: từ 90 Xuất sắc…" là **sai căn cứ** (CV 214 không có nội dung này). Mâu thuẫn với `nghiep-vu-danh-gia-kpi.md` §10 ("không tự xếp loại theo ngưỡng"). | HD 20 5.1, 5.3; CV 214 II.1.4 | `utils/selfReview.ts:22`, `utils/rating.ts:70`, `pages/Dashboard.tsx` ("Vạch đứt: ngưỡng 90 · 70 · 50") | Bỏ gợi ý theo điểm; hiển thị **phân nhóm 1/2/3 (≥70 / 50–<70 / <50)**; vạch biểu đồ 70·50. Sửa README. |
| N2 | Cao | `nghiep-vu-danh-gia-kpi.md` §6.4 ghi "KPI quý/năm không lấy bình quân". HD 20 mục 5.2: "Điểm KPI hằng quý, hằng năm được xác định bằng **bình quân** điểm KPI theo hằng tháng". `quy-trinh-ky-kpi-cong-viec.md` lại ghi bình quân → hai tài liệu nội bộ mâu thuẫn. | HD 20 5.2 | docs | Sửa §6.4 theo HD 20. |
| N3 | Trung bình | Mẫu phiếu xếp loại quý (KĐLĐCH‑1, quy trình 5 bước CV 214 phần II, CV 881 phần II) áp dụng cho **lãnh đạo, chỉ huy**. Với CB không giữ chức vụ, CV 214 chỉ yêu cầu chấm KPI (mẫu CĐKPI‑CN), cấp phòng quyết định. Phụ lục quy đổi nhắc "Mẫu KĐCN‑1" nhưng không kèm mẫu. App + tài liệu luồng đang cho CB làm phiếu 30+70 — hợp lý theo HD 20 (G = E + KPI×0,7) nhưng là **giả định**. | CV 214 I.3, II; Phụ lục | `selfReview` | Giữ, nhưng gắn nhãn mẫu "KĐCN‑1 (tạm, theo HD 20)" thay vì "KĐLĐCH‑1"; xin xác nhận mẫu chính thức. |

---

## 3. Role và luồng duyệt

### 3.1 Cán bộ không giữ chức vụ

Văn bản (chú thích mẫu CĐKPI‑CN + CV 214 I.3):
- **Xác nhận:** chỉ huy cấp Đội (Đại đội trưởng với E11, E12); CB trực thuộc phòng → LĐ phòng phụ trách (Đội xe P5, Bệnh xá P8 → chỉ huy Đội); CB tại CQTT → Thủ trưởng CQTT.
- **Quyết định:** cấp ủy, lãnh đạo đơn vị **cấp phòng** (trừ CQTT → CQTT quyết định, gửi về phòng chủ quản).

App (`utils/reviewFlow.ts`, `utils/appraisal.ts`): ① Tự đánh giá → ② "LĐ phòng đánh giá" → ③ "LĐ đơn vị đánh giá" → ④.

| # | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| R1 | Cao | Tên bước lấy theo hệ thống mẫu (phòng trong Sở → lãnh đạo Sở). Ở K02 "phòng" **là** đơn vị cấp quyết định. Với CB thuộc Đội: ② phải là *Chỉ huy Đội xác nhận*, ③ là *Lãnh đạo phòng quyết định*. | Đổi tên bước: "Xác nhận (chỉ huy trực tiếp)" → "Quyết định (cấp phòng)"; người xử lý suy ra theo cây. |
| R2 | Cao | `firstHandler` = lãnh đạo của chính đơn vị → với demo `canbo` (chiến sĩ Tiểu đội 1) người nhận là **Tiểu đội trưởng**, không phải người xác nhận theo mẫu. | Người xác nhận = chỉ huy cấp Đội/Đại đội gần nhất (hoặc LĐ phòng phụ trách); có ngoại lệ E11/E12, CQTT. |
| R3 | Cao | `actingLayer('dept')`: **mọi lãnh đạo ở bất kỳ đơn vị cấp trên** đều nhập được lớp "LĐ phòng" (kể cả Phó Tư lệnh). | Chỉ người xác nhận được chỉ định (và cấp phó được phân công) mới nhập lớp đó. |
| R4 | Trung bình | Chưa có CQTT, cán bộ trưng tập (đơn vị trưng tập xác nhận, đơn vị quản lý chấm) | Thêm thuộc tính đơn vị CQTT / trạng thái trưng tập (`seconded` đã có ở `MemberStatus`). |

### 3.2 Lãnh đạo phòng (Trưởng/Phó phòng, Trung đoàn trưởng và tương đương)

Văn bản: tự đánh giá CĐKPI‑LĐCH (có D) + KĐLĐCH‑1 → **xác nhận**: Trưởng phòng/Trung đoàn trưởng; nếu là cấp trưởng thì **cấp phó ký xác nhận** → nộp P. TCCB trước ngày 10 tháng cuối quý → **P. TCCB thẩm định, đề xuất** (P. Tham mưu phối hợp, cơ quan chính trị/thanh tra cho ý kiến) → **BTV/Lãnh đạo BTL quyết định**. KPI cá nhân người đứng đầu ≤ KPI tập thể phòng (tập thể phòng do P. Tham mưu thẩm định trước).

App: ① Tự đánh giá → ③ lãnh đạo đơn vị cấp trên (BTL) → ④.

| # | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| R5 | Cao | Thiếu bước **xác nhận** (Trưởng phòng cho phó; **cấp phó cho trưởng**). `confirmerOf` của cấp trưởng trả về chỉ huy cấp trên — ngược với chú thích mẫu. | Sửa `confirmerOf`: cấp trưởng → cấp phó (ưu tiên phó bí thư). |
| R6 | Cao | Thiếu bước **P. TCCB thẩm định/đề xuất** trước khi BTL quyết định; role `tccb` chỉ có `appraisal: V`. | `tccb`: `appraisal: VW` cho phiếu LĐCH cấp phòng; `tham-muu`: góp ý. |
| R7 | Trung bình | Chưa ràng buộc thứ tự: KPI tập thể phòng phải có trước khi chốt KPI người đứng đầu (đã chặn KPI cá nhân > tập thể ở bảng điểm, cần áp ở luồng). | Chặn gửi/quyết định khi tập thể chưa có kết quả. |

### 3.3 Mô hình quyền (`data/roles.ts`)

| # | Mức | Vấn đề | Đề xuất |
|---|---|---|---|
| R8 | Cao | `chi-huy` không có `decision`. CV 214: lãnh đạo **cấp phòng** quyết định KPI cho tập thể cấp đội trở xuống, chỉ huy cấp đội trở xuống, CB không chức vụ. Hiện chỉ `lanh-dao` (BTL) quyết định. | Quyền quyết định theo **cấp đơn vị**: trưởng cấp phòng → phạm vi cây của mình (trừ LĐCH cấp phòng). |
| R9 | Trung bình | Vai trò chỉ huy gán cứng trên tài khoản (`daidoitruong: chi-huy`) song song với `member.role = truong/pho`. Đổi chức vụ trên cây mà quên đổi tài khoản → quyền lệch. `nghiep-vu-danh-gia-kpi.md` §1.1 yêu cầu "phân quyền theo vị trí trên cây". | Suy ra chi-huy/chi-huy-pho từ `member.role`; tài khoản chỉ giữ vai trò chức năng (tham-muu, tccb, lanh-dao, quan-tri). |

---

## 4. UI/UX — role Cán bộ so với tài liệu luồng màn

### 4.1 Sidebar (ảnh 1)
- Mẫu: Dashboard · Đánh giá KPI › Tự đánh giá · Nhiệm vụ của tôi · Cài đặt hiển thị SP.
- App: Tổng quan · Thông báo · Nhiệm vụ (Nhiệm vụ của tôi, Biểu đồ sự kiện) · Đánh giá KPI (Tự đánh giá, Công khai kết quả) · Cơ cấu tổ chức.
- **Thiếu "Cài đặt hiển thị SP"**. Thừa so với mẫu: Biểu đồ sự kiện, Công khai kết quả, Cơ cấu tổ chức (Công khai kết quả có căn cứ — CV 214 bước 5; hai mục còn lại cần xác nhận giữ hay ẩn).

### 4.2 Dashboard (ảnh 9, 8)
| Mẫu | App | Đánh giá |
|---|---|---|
| Chọn Năm + Tháng (01–12), nút "Cá nhân" | Không có bộ chọn kỳ; hiển thị phiếu gần nhất | **Thiếu** |
| Thẻ "Điểm đánh giá" + "Số lượng công việc quy đổi" | Chỉ số KPI + tổng điểm | Gần đúng, thiếu tổng quy đổi (ΣM) |
| 3 gauge kèm "Số lượng hoàn thành x/y", "Số lần trả lại", "Số lần chậm" | 3 gauge A/B/C, chỉ có gợi ý chung | **Thiếu số liệu đếm** |
| Bảng "Kết quả thực hiện theo nhiệm vụ" (thanh % từng nhiệm vụ) | Không có | **Thiếu** |
| Biểu đồ 12 tháng gần nhất | Biểu đồ theo quý, vạch 90/70/50 | Lệch đơn vị kỳ; vạch sai căn cứ (N1) |
| — | Thẻ đang thực hiện/quá hạn/chờ duyệt, Sắp đến hạn | Bổ sung tốt, giữ |

### 4.3 Tự đánh giá (ảnh 7, 10, 2)
- Dòng "II. Nhóm tiêu chí về kết quả thực hiện nhiệm vụ (70)" có nút "Xem nhiệm vụ" + popup bảng CĐKPI: **đã có, đúng hướng**.
- Lệch nhỏ: popup mẫu có chọn Năm/Tháng và nút "Điểm KPI" (xem cách tính `(A%+B%+C%)/3 × 70`); app theo kỳ, có tooltip/khối D. Có thể thêm dòng diễn giải công thức ở chân bảng như mẫu.

### 4.4 Nhiệm vụ của tôi (ảnh 5, 3, 6, 11, 4) — chênh lệch lớn nhất
| Mẫu | App |
|---|---|
| Bộ chọn Năm/Tháng, lọc Sản phẩm/công việc, từ khoá | Tab trạng thái + tìm + chọn kỳ |
| Nút Thêm · Sửa · Xoá · Kết nối dữ liệu · **Nạp dữ liệu** | **Không có**; chỉ mở drawer từng việc để thêm sản phẩm |
| Cột: Mã (cha ▸ con), Tên + sản phẩm/điểm, Ngày bắt đầu, Hạn, **Ngày hoàn thành**, **Số ngày quá hạn**, **Số lần bị trả lại**, Trạng thái | STT, Nhiệm vụ, Vai trò, Hạn, Tiến độ sản phẩm, Trạng thái |
| Form "Cập nhật thông tin nhiệm vụ": Tên (gõ → gợi ý nhiệm vụ khớp, có %), Sản phẩm/công việc (dropdown nhóm Nhóm 1/2/3 kèm điểm, có ô tìm), Thuộc kế hoạch, Nội dung, Số lượng, Số lần bị trả lại, Ngày bắt đầu/Hạn/Ngày hoàn thành, Trạng thái, Tính chất, Tiến độ xử lý, File | Drawer chỉ có Tên sản phẩm (datalist), Ngày hoàn thành, Ghi chú |
| Popup "Nạp dữ liệu": chọn mẫu, Chọn file, **Tải file mẫu**, lưới nhiều dòng, gợi ý tên (không bắt buộc chọn), Thêm dòng | `ImportTasksDialog` có sẵn nhưng **chỉ dùng ở Quản lý nhiệm vụ** |

**Xung đột nghiệp vụ cần quyết định (D1):** màn mẫu cho cán bộ **tự tạo nhiệm vụ và tự khai số lần bị trả lại**. Văn bản: nhiệm vụ do cấp có thẩm quyền giao theo Danh mục; chất lượng/tiến độ do người có thẩm quyền đánh giá (HD 20, CV 214 II.1.2 "cấp ủy, lãnh đạo chịu trách nhiệm kiểm đếm"). `quy-trinh-ky-kpi-cong-viec.md` cũng quy định việc KPI chỉ được giao, không tự tạo.

---

## 4b. Đối chiếu lại từng yêu cầu trong docx (đọc lại 24/10 07:38 — file không đổi, md5 36f64767…)

Docx chỉ có phần **Role Cán bộ không giữ chức vụ**; không có mục nào cho LĐ phòng. Alt text ảnh 10/2: "Phần trên/dưới của pop up tự đánh giá nhiệm vụ kpi (trong phần 2 màn tự đánh giá)".

| # | Yêu cầu docx | App | Kết quả |
|---|---|---|---|
| 1 | Sidebar: Dashboard · Đánh giá KPI › Tự đánh giá · Nhiệm vụ của tôi · Cài đặt hiển thị SP | Tổng quan · Thông báo · Nhiệm vụ (NV của tôi, Biểu đồ sự kiện) · Đánh giá KPI (Tự đánh giá, Công khai KQ) · Cơ cấu tổ chức | ⚠️ Thiếu "Cài đặt hiển thị SP"; thừa 3 mục |
| 2 | Dashboard "xem được của cá nhân" | Cá nhân (CB không có tab đơn vị) | ✅ |
| 2a | Năm + Tháng 01–12, nút "Cá nhân" | Không có bộ chọn | ❌ |
| 2b | Điểm đánh giá + SL công việc quy đổi | KPI + tổng điểm | ⚠️ thiếu ΣM quy đổi |
| 2c | 3 gauge + "SL hoàn thành 97/144,1", "Số lần trả lại", "Số lần chậm" | 3 gauge A/B/C, không số đếm | ❌ |
| 2d | Bảng "Kết quả thực hiện theo nhiệm vụ" (% từng NV) | Không có | ❌ |
| 2e | "Điểm đánh giá theo thời gian" 12 tháng | "Điểm qua các kỳ" theo quý, vạch 90/70/50 | ⚠️ |
| 2f | Số liệu dashboard cùng một nguồn | Gauge lấy từ phiếu mẫu; "Sắp đến hạn" lấy từ việc KPI thật → hai nguồn lệch nhau | ❌ |
| 3 | Màn tự đánh giá khác nhau theo vai trò | `reviewKind`: CN / LĐCH; bộ tiêu chí 20/8/2 vs 18/4/8 | ✅ |
| 3a | Dòng II (70 điểm) có "Xem nhiệm vụ" | Có | ✅ |
| 3b | Có nút "Điểm KPI" cạnh "Xem nhiệm vụ" | Không có | ❌ (chưa rõ chức năng) |
| 3c | Popup liệt kê **nhiệm vụ trong kỳ đó** | `review.tasks` là **dữ liệu mẫu cố định** (`data/selfReviews.ts`: TM‑01…TM‑11), không lấy từ việc KPI đã giao trong "Nhiệm vụ của tôi" | ❌ **Lỗi nghiêm trọng** — đứt luồng Nhiệm vụ của tôi → Tự đánh giá |
| 3d | "Bê nguyên cấu trúc bảng 3 vai trò ở bảng điểm KPI" | 15 cột theo `headRows(kind)`, mã mẫu CĐKPI‑CN/LĐCH | ✅ |
| 3e | Cột phải điền (trừ cột tự tính) | Nhập (7) SL hoàn thành, (10) mức chất lượng, (13) mức tiến độ, (15) ghi chú; còn lại tự tính | ✅ |
| 3f | Popup có Năm/Tháng | Theo kỳ của phiếu | ⚠️ |
| 3g | Góc trên: "Điểm đánh giá 45,18 · Tốt" | Không có ô điểm góc trên; chân hiển thị KPI /100 | ⚠️ — nhãn "Tốt" theo điểm là xếp loại theo ngưỡng (xem N1), **không nên chép** |
| 3h | Chân: Tổng cộng + dòng %, công thức (A%+B%+C%)/3 × 70, "Điểm đánh giá KPI tháng này x/70" | Tổng ΣM/ΣA/ΣB/ΣC, A/B/C 3 chữ số, KPI /100, dòng "KPI × 0,7 = …/70" | ✅ đủ nội dung; nên đưa /70 lên chính |
| 3i | "Cập nhật dữ liệu" dưới tên nhiệm vụ (nhảy sang cập nhật NV) | Không có | ❌ |
| 3j | Ô số lượng giao kèm "7/5 = 1,4" (bình quân) | Có `taskAverages` + tooltip | ✅ |
| 4 | Nhiệm vụ của tôi: bảng Mã (cha ▸ con), Tên + sản phẩm‑điểm, Ngày BĐ, Hạn, Ngày HT, Số ngày quá hạn, Số lần bị trả lại, Trạng thái | STT, Nhiệm vụ, Vai trò, Hạn, Tiến độ SP, Trạng thái | ❌ thiếu 5 cột, không có cây cha‑con |
| 4a | Năm/Tháng, lọc Sản phẩm/công việc, Thêm/Sửa/Xoá/Kết nối dữ liệu/Nạp dữ liệu | Tab + tìm + kỳ; không có nút | ❌ |
| 5 | Form "Cập nhật thông tin nhiệm vụ": gõ tên → gợi ý nhiệm vụ khớp để chọn | Drawer theo từng việc; ô tên sản phẩm dùng datalist tên đã dùng | ❌ |
| 5a | Dropdown Sản phẩm/công việc chia theo Nhóm 1/2/3 kèm điểm, có ô tìm | Không có trong NV của tôi (`TaskNameCombo` chỉ dùng ở Quản lý NV) | ❌ |
| 5b | Trường: Thuộc kế hoạch, Nội dung, Số lượng, Số lần bị trả lại, Ngày BĐ/Hạn/Ngày HT, Trạng thái, Tính chất, Tiến độ xử lý, File | Tên SP, Ngày HT, Ghi chú | ❌ |
| 6 | Nạp dữ liệu: chọn mẫu, Chọn file, Tải file mẫu, lưới nhiều dòng, gợi ý tên (không bắt buộc chọn), Thêm dòng, Lưu | `ImportTasksDialog` có nhưng chỉ ở Quản lý NV | ❌ (dùng lại được) |

Tổng: ✅ 9 · ⚠️ 6 · ❌ 15.

## 4c. Tài liệu đầy đủ 4 thẻ — `src/docs/Role cán bộ không giữ chức vụ , role lãnh đạo phòng (1).docx` (10,5 MB, 33 ảnh, lưu 24/10 08:11)

Nội dung chữ trùng Google Doc (Acronyms · Role CB · Role LĐ phòng · Đặc tả nghiệp vụ). Phần Role CB trùng docx cũ (đối chiếu ở 4b). Ảnh độ phân giải đầy đủ bổ sung các chi tiết sau so với lần xem qua trình duyệt:

| # | Chi tiết mới từ ảnh | Ảnh | Đánh giá |
|---|---|---|---|
| A1 | Màn thẩm định có mục **"III. ĐIỂM CỘNG (10 điểm)"** dưới nhóm 70 | image32 | **Không chép.** Mẫu KĐLĐCH‑1 / HD 20 chỉ có 30 + 70 = 100; điểm cộng là của hệ thống mẫu (Sở Nội vụ Thái Nguyên) |
| A2 | Dòng "Có trên 30% nhiệm vụ vượt mức…; có sáng kiến…" là **một nhiệm vụ có điểm** (6,53 ≈ 15% ΣM = 43,53), nằm trong mẫu số → ai không có sáng kiến bị giảm A/B/C | image15, image18 | **Trái HD 20**: vượt mức tính tối đa 120% trên từng sản phẩm, không có dòng thưởng riêng. Đặc tả 3.4 cũng yêu cầu chờ quy tắc chính thức → đề nghị không làm |
| A3 | Popup NV: "Điểm đánh giá 59,37 · **Tốt**" góc trên | image20 | Nhãn xếp loại theo điểm — trái N1 / Đặc tả 3.4 |
| A4 | Ở màn thẩm định, dòng II chỉ còn nút **"Điểm KPI"** (mở popup), cột LĐ phòng = 59,37 tự lấy từ popup | image32 | App: nút "Xem nhiệm vụ" trong `AppraisalDetail` — tương đương ✅ |
| A5 | Danh sách LĐ phòng đánh giá có **checkbox + nút "Đánh giá" hàng loạt**; hành động mỗi dòng: đánh giá · gửi/trình · xem tiến độ | image27, image13 | App không có chọn nhiều / đánh giá hàng loạt ❌ |
| A6 | Thanh trên màn thẩm định: ô hiển thị **người được đánh giá** ("CV4 – Chuyên viên Phòng Văn hoá – Xã hội"), **"Hạn đánh giá: 24/07/2026"** | image19 | App có header phiếu; cần kiểm hạn thẩm định riêng (khác hạn gửi) ⚠️ |
| A7 | LĐ phòng sửa **số lượng giao** trực tiếp trong ô (5), có ▲ xanh khi trên bình quân, hiển thị "24 / 9 = 2,67" | image15, image20 | App: nút bút → `QtyAdjustDialog` (thêm lý do, ngày áp dụng — đúng Đặc tả 3.3) ✅ |
| A8 | Quy đổi chất lượng theo **từng sản phẩm**: 7 hoàn thành, 1 lần làm lại → 6,75 (= 6×1 + 1×0,75) | image20 | Khớp HD 20 và cách tính theo phần (`fullParts`) của app ✅ |
| A9 | Tự đánh giá LĐP: cột "Tài liệu kiểm chứng, giải trình" có **nút tải tệp** mỗi tiêu chí; nút **"Lấy dữ liệu tự động"** | image33 | App chỉ có ô ghi chú, không tải minh chứng; không có "Lấy dữ liệu tự động" ❌ (chưa rõ nút này lấy gì) |
| A10 | Theo dõi NV: lọc Người thực hiện + Sản phẩm/công việc + từ khoá; cột Người thực hiện kèm phòng; trạng thái gồm Chờ duyệt / Hoàn thành / **Yêu cầu làm lại** | image22 | App có bộ lọc và trạng thái tương ứng ✅ |
| A11 | Form giao NV có **Người thực hiện**, **Thuộc kế hoạch/nhiệm vụ** (chọn NV cha) | image14 | App: `KpiTaskForm` + `ChildTaskDialog` ✅; "Tính chất" thay bằng loại việc theo yêu cầu ✅ |
| A12 | Biểu đồ sự kiện: tooltip hover (Bắt đầu, Hạn, Người thực hiện, Tính chất, Trạng thái %, Ngày hoàn thành); popup **"Nhật ký nhiệm vụ"** = cây cha‑con + thanh thời gian từng NV + bảng chi tiết (Người tạo, Người thực hiện, Sản phẩm, ngày, Trạng thái, Số lần yêu cầu làm lại, Tiến độ %) | image30, image28 | App `EventTimeline` chưa có ❌ (giữ L14) |

**Thẻ Acronyms** định nghĩa mô hình 3 cấp: Cán bộ không giữ chức vụ → LĐ phòng → LĐ đơn vị. → Điều chỉnh R1: tên bước "LĐ phòng / LĐ đơn vị" là **đúng ý đồ**. Ánh xạ sang K02 nên là: *LĐ phòng* = chỉ huy trực tiếp xác nhận (Đội/Ban/LĐ phòng phụ trách — CĐKPI‑CN), *LĐ đơn vị* = cấp quyết định (cấp phòng/trung đoàn — CV 214 I.3). R2, R3 vẫn giữ: cần xác định đúng ai là "LĐ phòng" của từng cán bộ trên cây K02.

### Thẻ Role lãnh đạo phòng
| # | Yêu cầu | App | KQ |
|---|---|---|---|
| L1 | Sidebar: Dashboard · Đánh giá KPI › Tự đánh giá, **LĐ phòng đánh giá** · **Lập kế hoạch** · Theo dõi nhiệm vụ · Nhiệm vụ của tôi · Cài đặt hiển thị SP · Biểu đồ sự kiện | Có Thẩm định (= LĐ phòng đánh giá), Quản lý NV (= Theo dõi NV), NV của tôi, Biểu đồ sự kiện; **thiếu Lập kế hoạch, Cài đặt hiển thị SP**; chi-huy không có quyền Kỳ KPI | ⚠️ |
| L2 | Dashboard Cá nhân / Phòng | Tab Cá nhân / Phòng‑đơn vị (`TeamPanel`) | ✅ (còn thiếu Năm/Tháng, số đếm như 2a–2d) |
| L3 | Tự đánh giá LĐP: stepper Tự đánh giá → LĐ đơn vị → Hoàn thành; Hạn gửi; nút Lấy dữ liệu tự động, Gửi đánh giá, In phiếu; cột "Tài liệu kiểm chứng, giải trình" có **đính kèm** | Luồng LĐP bỏ bước dept ✅; SubmitDeadline ✅; Export ✅; ô ghi chú có, **không có tải minh chứng**; không có "Lấy dữ liệu tự động" | ⚠️ |
| L4 | Danh sách LĐ phòng đánh giá: stepper 4 bước, cột **Thời gian gửi**, Họ tên, Phòng ban, Tự đánh giá, LĐ phòng đánh giá, Hành động (sửa/gửi/xem) | `AppraisalList`: ReviewStepper ✅, cột Tự ĐG/LĐ phòng/LĐ đơn vị ✅; **thiếu Thời gian gửi**; có thêm Mẫu, Trạng thái | ⚠️ |
| L5 | Popup "Tiến độ công việc": ngày thực hiện, người thực hiện, người xử lý tiếp theo, công việc, nội dung | `FlowDialog` ("Tiến độ xử lý") | ✅ |
| L6 | Màn thẩm định: như phiếu cán bộ + cột LĐ phòng đánh giá; nút **Lấy điểm**, Gửi đánh giá, Trả lại, Quay lại | `AppraisalDetail` đủ các cột lớp + Lấy điểm + Trả lại + Gửi đánh giá | ✅ |
| L7 | Popup NV: số lượng bình quân/người (tooltip), mũi tên xanh trên bình quân / đỏ dưới | `taskAverages` + tooltip đúng câu + ArrowUp/Down | ✅ |
| L8 | Giao lại số lượng + popup xác nhận "đổi từ 1 thành 2?" → điểm số lượng giảm | `QtyAdjustDialog` (trước/sau, lý do, ngày áp dụng, bước Xác nhận); `adjustQty` sửa qty, kẹp done | ✅ |
| L9 | Dòng "Có trên 30% nhiệm vụ hoàn thành vượt mức…; có sáng kiến…" là **một dòng nhiệm vụ** có điểm (6,53) trong bảng | App chỉ hiện tỷ lệ vượt mức dạng chú thích (`overShare`), không có dòng | ⚠️ — Bổ sung 3.4 yêu cầu chờ quy tắc chính thức; HD 20/CV 214 không có dòng này |
| L10 | Gửi đánh giá: popup "Xử lý đánh giá" — Nội dung + **chọn lãnh đạo đơn vị** (radio) | `ReasonDialog` với `approvers` + Nội dung | ✅ |
| L11 | Trả lại: lý do (text), phiếu về cán bộ ngay, cán bộ sửa và gửi lại | `returnReview` + trạng thái `returned` | ✅ (Bổ sung 4.2: cần kiểm thông báo + lịch sử các lần trả) |
| L12 | Theo dõi NV: lọc người thực hiện / sản phẩm / từ khoá, Năm/Tháng, Thêm · Sửa · Duyệt kết quả · Xoá, nhóm cha‑con thu gọn, nút + thêm NV con | `TaskManagement`: tháng ✅, cây + thu gọn ✅, `ChildTaskDialog` ✅, Duyệt ✅ | ✅ |
| L13 | Form NV: thay "Tính chất (Chiến lược/Thường xuyên)" bằng **loại: kỳ KPI / chưa gắn kỳ / hằng ngày** | App đã tách việc KPI (có/chưa kỳ) và việc hằng ngày | ✅ |
| L14 | Biểu đồ sự kiện: **Từ ngày – Đến ngày**, tìm kiếm, chú giải 3 trạng thái, Gantt theo ngày, **cây NV cha‑con mở bằng mũi tên**, tooltip khi hover, popup "Thông tin kế hoạch"/"Nhật ký nhiệm vụ" (cây con + thanh tiến độ + chi tiết) | `EventTimeline`: chọn theo **kỳ**, Cá nhân/Đơn vị, chú giải; **không có khoảng ngày, không có cây cha‑con, không có tooltip/popup chi tiết** | ❌ |

### Thẻ Bổ sung nghiệp vụ
| Mục | Yêu cầu | App | KQ |
|---|---|---|---|
| 1.5 | Tiến độ mục tiêu ≠ trạng thái việc; **không mặc định trung bình con** | Chưa có tiến độ mục tiêu tổng hợp | ⚠️ cần chọn cơ chế |
| 2.1 | Ghi **nguồn hình thành** NV (tự cập nhật / LĐ giao / NV con / Excel‑hệ thống khác) | Có `source` ở sản phẩm (form/import), chưa ở nhiệm vụ | ⚠️ |
| 2.2 | Nhập hàng loạt: kiểm bắt buộc, ngày, danh mục, **trùng lặp**, lỗi theo từng dòng; gợi ý không tự thay nội dung | `ImportTasksDialog` (chưa kiểm trùng lặp — cần xác minh) | ⚠️ |
| 2.3 | Cán bộ báo xong → chờ duyệt; LĐ xác nhận / yêu cầu bổ sung; lưu lịch sử | Có (pending/approved/returned + history) | ✅ |
| 3.2 | Điểm NV = (A+B+C)/3 × 70 | `tasksKpi` = KPI × 0,7 — tương đương | ✅ |
| 3.3 | Giao lại SL: trước/sau, cảnh báo, người‑thời điểm‑lý do, ngày áp dụng; không sửa phiếu đã duyệt | Có đủ; cần chặn khi phiếu đã khoá | ✅/⚠️ |
| 3.4 | Không tự suy diễn / tự xếp loại xuất sắc | Đúng ở popup; **nhưng còn gợi ý 90/70/50** (N1) | ⚠️ |
| 4.1–4.2 | Luồng gửi → LĐP (lấy điểm, sửa, trả lại) → trình LĐ đơn vị → phê duyệt; lưu lý do, thông báo, lịch sử gửi/trả | Có luồng; cần kiểm thông báo + lịch sử nhiều lần trả | ✅/⚠️ |
| 4.3 | **Kiểm quyền phía máy chủ** cho chỉnh điểm, giao việc, phê duyệt | App chỉ kiểm phía client; Firestore cần Security Rules | ❌ |
| 5 | Nhật ký: tạo/sửa/giao lại/huỷ, đổi người/hạn, trạng thái, SL, điểm, gửi/trả/duyệt; trước–sau | Lịch sử từng việc/phiếu có; màn "Lịch sử & nhật ký kiểm toán" **chưa xây** (không trong `builtPaths`) | ⚠️ |

## 5. Thứ tự ưu tiên đề xuất
0. **3c** — sinh dòng nhiệm vụ của phiếu tự đánh giá từ việc KPI đã giao cho cán bộ trong kỳ (gợi ý SL hoàn thành = số sản phẩm đã duyệt, số lần sửa/nhắc từ nhật ký duyệt); dashboard dùng cùng nguồn (2f).
1. N1 (bỏ xếp loại theo 90/70/50), N2 (sửa doc) — nhỏ, rủi ro thấp.
2. R2, R3, R5, R8 — đúng người xác nhận / quyết định.
3. Nhiệm vụ của tôi: form cập nhật + nạp dữ liệu (dùng lại `ImportTasksDialog`, `TaskNameCombo`) sau khi chốt D1.
4. Dashboard: bộ chọn năm/tháng, số đếm dưới gauge, bảng kết quả theo nhiệm vụ.
5. Lãnh đạo phòng: Biểu đồ sự kiện (khoảng ngày, cây cha‑con, tooltip, popup Nhật ký NV — L14/A12); tải minh chứng theo tiêu chí (A9); đánh giá hàng loạt (A5); cột Thời gian gửi (L4); mục "Lập kế hoạch" (L1).
6. Đặc tả: kiểm quyền phía máy chủ / Firestore Security Rules (4.3); màn Nhật ký kiểm toán (5); nguồn hình thành nhiệm vụ (2.1); kiểm trùng khi nhập Excel (2.2).
7. R6, R7, R9, R4, N3.

**Không làm theo mẫu:** điểm cộng 10 (A1), dòng thưởng "trên 30% vượt mức/sáng kiến" (A2), nhãn xếp loại theo điểm (A3, N1) — không có căn cứ trong HD 20 / CV 214 / CV 881 và Đặc tả 3.4 cũng yêu cầu không tự suy diễn.

## Câu hỏi chưa giải quyết
1. (D1) Cán bộ có được tự thêm nhiệm vụ/sản phẩm và tự khai "số lần bị trả lại" không, hay chỉ khai sản phẩm, còn số lần sửa/nhắc lấy từ nhật ký duyệt? (Đặc tả 2.1 có "nhiệm vụ thường xuyên do cán bộ chủ động cập nhật" → nghiêng về cho tự thêm; số lần làm lại vẫn nên lấy từ duyệt)
2. "Cài đặt hiển thị SP" cụ thể làm gì? (giả định: cán bộ chọn các sản phẩm danh mục hiện trong dropdown của mình)
3. Mẫu phiếu xếp loại quý chính thức cho CB không giữ chức vụ (KĐCN‑1?) — có văn bản không?
4. Dashboard / Nhiệm vụ của tôi chọn theo **tháng** như mẫu — có nghĩa đơn vị dùng kỳ tháng (15→14) làm mặc định?
5. "Lập kế hoạch" (sidebar LĐ phòng) là màn gì — trùng Kỳ KPI / Giao việc hay màn OKR mục tiêu lớn (Đặc tả mục 1)?
6. Nút "Lấy dữ liệu tự động" ở tự đánh giá LĐ phòng lấy dữ liệu gì (KPI từ nhiệm vụ? D từ kết quả cấp dưới?)
7. Tiến độ mục tiêu lớn (Đặc tả 1.5): cập nhật thủ công hay tổng hợp có trọng số — trọng số nào?
8. Trên cây K02, "LĐ phòng" của từng cán bộ là ai (chỉ huy Đội? Đại đội? LĐ phòng phụ trách?) và "LĐ đơn vị" là cấp nào?
