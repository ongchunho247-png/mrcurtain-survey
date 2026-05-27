# Hướng dẫn Deploy & Sử dụng MrCurtain Survey

## Tổng quan

Ứng dụng là file HTML tĩnh — không cần server, không cần build.  
Chỉ cần upload 4 file lên hosting là xong.

---

## Các file cần upload

```
index.html       ← toàn bộ ứng dụng
manifest.json    ← cấu hình PWA
icon-192.png     ← icon hiển thị trên màn hình điện thoại
icon-512.png     ← icon độ phân giải cao
```

---

## Cách deploy lên Netlify (miễn phí, dễ nhất)

### Bước 1 — Tạo tài khoản
1. Vào https://netlify.com → **Sign up** (có thể dùng tài khoản Google)

### Bước 2 — Upload file
1. Sau khi đăng nhập, chọn tab **Sites**
2. Kéo thả **thư mục chứa 4 file** vào vùng "Drag and drop your site output folder here"  
   *(hoặc chọn "Browse to upload" → chọn thư mục)*
3. Netlify tự cấp URL dạng: `https://ten-ngau-nhien.netlify.app`

### Bước 3 — Đổi tên miền (tuỳ chọn)
1. Vào **Site settings → Domain management → Options → Edit site name**
2. Đặt tên dễ nhớ, ví dụ: `mrcurtain-survey` → URL thành `https://mrcurtain-survey.netlify.app`

### Bước 4 — Cập nhật ứng dụng sau này
Kéo thả lại thư mục vào trang **Deploys** → Netlify tự cập nhật URL cũ.

---

## Cách deploy lên Vercel (thay thế)

1. Vào https://vercel.com → **Sign up**
2. Chọn **Add New → Project → Browse** → upload thư mục 4 file
3. Nhấn **Deploy** → nhận URL dạng `https://ten-du-an.vercel.app`

---

## Thêm vào màn hình chính điện thoại

### iPhone / iPad (Safari)
1. Mở Safari → truy cập URL của ứng dụng
2. Nhấn nút **Chia sẻ** (biểu tượng hình vuông có mũi tên lên, ở thanh dưới)
3. Cuộn xuống → chọn **"Thêm vào Màn hình chính"**
4. Đặt tên ngắn gọn (ví dụ: **MrCurtain**) → nhấn **Thêm**
5. Icon xuất hiện trên màn hình chính, mở như app thật

> **Lưu ý Safari:** Chỉ hoạt động trên Safari, không dùng Chrome/Firefox trên iPhone.

### Android (Chrome)
1. Mở Chrome → truy cập URL của ứng dụng
2. Nhấn nút **⋮** (ba chấm góc trên phải)
3. Chọn **"Thêm vào màn hình chính"** hoặc **"Cài đặt ứng dụng"**
4. Nhấn **Thêm** → icon xuất hiện trên màn hình chính

---

## ⚠️ Cảnh báo quan trọng về dữ liệu

Ứng dụng lưu dữ liệu **trực tiếp trên thiết bị** (localStorage của trình duyệt).  
Điều này có nghĩa:

| Tình huống | Kết quả |
|---|---|
| Dùng trên điện thoại A | Chỉ thấy dữ liệu của điện thoại A |
| Dùng trên điện thoại B | Dữ liệu hoàn toàn riêng biệt với A |
| Xoá dữ liệu trình duyệt / Safari | **Mất toàn bộ dữ liệu** |
| Cập nhật iOS/Android | Thường không ảnh hưởng |

**Khuyến nghị:**
- Mỗi nhân viên khảo sát dùng **thiết bị riêng** của họ
- Định kỳ **xuất báo cáo PDF hoặc ZIP ảnh** để lưu trữ
- Không dựa hoàn toàn vào ứng dụng để lưu dữ liệu lâu dài — xuất file thường xuyên

---

## Câu hỏi thường gặp

**Q: Có dùng được offline không?**  
A: Có — sau lần đầu tải xong, ứng dụng hoạt động offline bình thường (dữ liệu đã lưu trên máy).

**Q: Nhiều người có dùng chung được không?**  
A: Không tự động đồng bộ. Mỗi thiết bị lưu dữ liệu riêng.

**Q: Đổi điện thoại mới có mang dữ liệu sang được không?**  
A: Hiện tại chưa có tính năng này. Hãy xuất báo cáo trước khi đổi máy.
