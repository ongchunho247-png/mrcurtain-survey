# Hướng dẫn: GitHub + Netlify Auto-Deploy

## Tổng quan

Thay vì kéo thả file thủ công lên Netlify mỗi lần cập nhật, ta thiết lập một lần duy nhất:

```
Sửa code trên máy tính
        ↓
git add + git commit + git push
        ↓
GitHub nhận code mới
        ↓
Netlify tự động deploy (~ 30 giây)
        ↓
Điện thoại nhân sự tải phiên bản mới (mở app lần sau)
```

**Dữ liệu trên điện thoại (công trình, ảnh, hashtag, ghi chú) không bị ảnh hưởng** — dữ liệu lưu trong bộ nhớ trình duyệt trên từng máy, hoàn toàn độc lập với code.

---

## ⚠️ Tại sao dữ liệu điện thoại KHÔNG bị mất khi deploy

| Khi deploy code mới | Điều gì xảy ra |
|---|---|
| Netlify cập nhật file index.html | ✅ Chỉ code ứng dụng thay đổi |
| localStorage trên điện thoại | ✅ Không bị chạm đến, giữ nguyên 100% |
| Công trình, ảnh, hashtag | ✅ Vẫn còn đủ |
| Điện thoại nhân sự | ✅ Tự nhận code mới khi mở app lần sau |

Ứng dụng dùng hệ thống **DATA_VERSION** (Prompt 14.2): nếu schema dữ liệu thay đổi, app tự động migrate an toàn (chỉ thêm field còn thiếu, không bao giờ xóa dữ liệu cũ).

---

## Phần 1 — Thiết lập lần đầu (làm một lần duy nhất)

### Bước 1 — Cài Git trên máy tính

**Windows:**
1. Vào https://git-scm.com/download/win → tải bản mới nhất
2. Chạy file `.exe` → nhấn Next liên tục, giữ mặc định
3. Sau khi cài xong, mở **Command Prompt** hoặc **PowerShell**, gõ:
   ```
   git --version
   ```
   Thấy `git version 2.x.x` là thành công.

4. Cấu hình tên và email (chỉ làm một lần):
   ```
   git config --global user.name "Ten Cua Ban"
   git config --global user.email "email@cua-ban.com"
   ```

**macOS:**
```
xcode-select --install
```
Hoặc tải tại https://git-scm.com/download/mac

---

### Bước 2 — Tạo tài khoản GitHub

1. Vào https://github.com → **Sign up**
2. Nhập email, mật khẩu, username
3. Xác nhận email

---

### Bước 3 — Tạo GitHub repository mới

1. Đăng nhập GitHub → nhấn nút **+** góc trên phải → **New repository**
2. Điền thông tin:
   - **Repository name:** `mrcurtain-survey` (hoặc tên bạn muốn)
   - **Description:** `Ứng dụng khảo sát MrCurtain`
   - **Visibility:** `Private` *(khuyến nghị — code chứa logic nghiệp vụ)*
   - Bỏ tick "Add a README file" *(đã có sẵn trong thư mục)*
3. Nhấn **Create repository**
4. GitHub hiện trang với đường dẫn dạng:
   ```
   https://github.com/ten-ban/mrcurtain-survey.git
   ```
   **Sao chép URL này** — sẽ dùng ở Bước 4.

---

### Bước 4 — Đẩy code lên GitHub lần đầu

Mở **Command Prompt / PowerShell / Terminal**, `cd` vào thư mục project:

```bash
cd "C:\Claude Code\web app mobile khao sat"
```

*(macOS/Linux: thay đường dẫn tương ứng)*

Chạy lần lượt từng lệnh:

```bash
# 1. Khởi tạo Git trong thư mục
git init

# 2. Thêm toàn bộ file (gitignore đã lọc file không cần thiết)
git add .

# 3. Commit đầu tiên
git commit -m "feat: khoi tao project MrCurtain Survey"

# 4. Đặt tên nhánh chính là main
git branch -M main

# 5. Kết nối với GitHub (thay URL bằng URL bạn sao chép ở Bước 3)
git remote add origin https://github.com/ten-ban/mrcurtain-survey.git

# 6. Đẩy code lên
git push -u origin main
```

GitHub sẽ yêu cầu đăng nhập:
- Nếu hiện cửa sổ → nhập username + password GitHub
- Nếu báo lỗi xác thực → xem phần **Xử lý lỗi xác thực** ở cuối tài liệu này

---

### Bước 5 — Kết nối Netlify với GitHub

1. Đăng nhập https://netlify.com
2. Nhấn **Add new site → Import an existing project**
3. Chọn **Deploy with GitHub**
4. Cấp quyền cho Netlify truy cập GitHub (chỉ làm một lần)
5. Tìm repo `mrcurtain-survey` → chọn

6. Cấu hình build:
   | Trường | Giá trị |
   |---|---|
   | Branch to deploy | `main` |
   | Base directory | *(để trống)* |
   | Build command | *(để trống)* |
   | Publish directory | `.` |

7. Nhấn **Deploy site**

Netlify sẽ deploy lần đầu (~30 giây). Bạn nhận URL dạng:
```
https://ten-ngau-nhien.netlify.app
```

---

### Bước 6 — Đặt tên miền dễ nhớ (tuỳ chọn)

1. Vào **Site settings → Domain management → Options → Edit site name**
2. Đặt tên: `mrcurtain-survey` → URL thành `https://mrcurtain-survey.netlify.app`

---

## Phần 2 — Quy trình cập nhật code sau này

Mỗi lần sửa code (thêm tính năng, sửa lỗi), chỉ cần 3 lệnh:

```bash
# Vào thư mục project
cd "C:\Claude Code\web app mobile khao sat"

# Thêm các file đã thay đổi
git add .

# Commit với mô tả ngắn
git commit -m "feat: them tinh nang X"

# Đẩy lên GitHub
git push
```

**Netlify tự động nhận và deploy trong ~30 giây.**  
Không cần làm gì thêm.

---

## Phần 3 — Quy ước đặt tên commit

Dùng tiền tố chuẩn để dễ tra lịch sử:

| Tiền tố | Dùng khi |
|---|---|
| `feat:` | Thêm tính năng mới |
| `fix:` | Sửa lỗi |
| `style:` | Chỉ sửa CSS / giao diện |
| `refactor:` | Cải tiến code, không đổi tính năng |
| `data:` | Thay đổi liên quan đến migration dữ liệu |
| `docs:` | Cập nhật tài liệu / hướng dẫn |

Ví dụ:
```
git commit -m "feat: them chuc nang loc anh theo trang thai"
git commit -m "fix: sua loi xuat PDF tren iOS"
git commit -m "data: nang cap DATA_VERSION len 1.3"
```

---

## Phần 4 — Xem lịch sử deploy

**Trên GitHub:**
- Vào repo → tab **Commits** → thấy toàn bộ lịch sử thay đổi

**Trên Netlify:**
- Vào site → tab **Deploys** → thấy từng lần deploy với trạng thái ✅/❌
- Nhấn vào một deploy cũ → **Publish deploy** để rollback nếu cần

---

## Phần 5 — Khi cần nâng cấp DATA_VERSION (schema thay đổi)

Nếu Prompt tiếp theo thêm field mới vào dữ liệu:

1. Tăng `DATA_VERSION` trong `index.html` (ví dụ: `'1.2'` → `'1.3'`)
2. Thêm hàm migrate mới (theo pattern `migrateImages_v1_2`)
3. Gọi hàm mới trong `runDataMigration()`
4. Commit + push

Khi điện thoại nhân sự mở app lần đầu sau deploy:
- App phát hiện `VERSION_KEY !== '1.3'`
- Tự động backup dữ liệu cũ
- Chạy migration an toàn (chỉ thêm field, không xóa gì)
- Ghi `VERSION_KEY = '1.3'`
- Nhân sự không thấy gì khác biệt

---

## Phần 6 — Xử lý lỗi thường gặp

### Lỗi xác thực GitHub (`Authentication failed`)

GitHub đã ngừng hỗ trợ đăng nhập bằng password thông thường. Cần dùng **Personal Access Token**:

1. GitHub → avatar góc trên phải → **Settings**
2. Cuộn xuống → **Developer settings → Personal access tokens → Tokens (classic)**
3. **Generate new token (classic)**
4. Đặt tên: `netlify-deploy`, chọn scope **repo** ✓
5. Nhấn **Generate token** → **sao chép ngay** (chỉ hiện một lần)
6. Khi Git hỏi password → dán token vào thay password

Lưu token vào nơi an toàn (password manager).

---

### Lỗi `remote origin already exists`

```bash
git remote remove origin
git remote add origin https://github.com/ten-ban/mrcurtain-survey.git
```

---

### Lỗi `rejected — non-fast-forward`

Thường xảy ra nếu GitHub có code mà máy local chưa có:

```bash
git pull origin main --rebase
git push
```

---

### Netlify deploy thất bại

1. Vào Netlify → **Deploys** → nhấn vào deploy lỗi → xem **Deploy log**
2. Lỗi thường gặp nhất: file `index.html` không có trong thư mục gốc
   - Kiểm tra `netlify.toml` có `publish = "."` chưa

---

## Tóm tắt file trong repository

```
mrcurtain-survey/
├── index.html          ← toàn bộ ứng dụng React
├── manifest.json       ← cấu hình PWA
├── icon-192.png        ← icon điện thoại
├── icon-512.png        ← icon độ phân giải cao
├── netlify.toml        ← cấu hình Netlify (cache, security headers)
├── .gitignore          ← loại trừ file không cần commit
├── HUONG-DAN-DEPLOY.md            ← hướng dẫn deploy thủ công (dự phòng)
└── HUONG-DAN-GITHUB-NETLIFY.md    ← tài liệu này
```

---

## Câu hỏi thường gặp

**Q: Nhân sự có cần làm gì khi app được cập nhật không?**  
A: Không. Lần tiếp theo họ mở app, trình duyệt tự tải phiên bản mới (nhờ header `no-cache` trong `netlify.toml`). Dữ liệu của họ giữ nguyên.

**Q: Có thể rollback về phiên bản cũ không?**  
A: Có — vào Netlify → Deploys → chọn bản cũ → **Publish deploy**.

**Q: Nhiều người có thể cùng sửa code không?**  
A: Có thể, nhưng cần phối hợp để tránh xung đột. Đơn giản nhất: một người duy nhất sửa code, còn lại chỉ dùng app.

**Q: Private repo trên GitHub có mất phí không?**  
A: Không — GitHub cung cấp private repo miễn phí không giới hạn.

**Q: Netlify có giới hạn số lần deploy không?**  
A: Gói miễn phí cho phép 300 build-minutes/tháng. Project này không có bước build → mỗi lần deploy dùng rất ít (~5 giây) → thực tế không bao giờ hết hạn mức.
