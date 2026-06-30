# 3TMUSIC - Frontend (React.js) 🎵

Đây là kho lưu trữ chứa mã nguồn giao diện người dùng (Frontend) của nền tảng âm nhạc trực tuyến **3TMUSIC**. 

Dự án này được xây dựng bằng React.js, Vite và TailwindCSS.

## 🚀 Hướng dẫn chạy dự án bằng Docker (Dành cho nhóm)

Để hệ thống Frontend và Backend có thể kết nối với nhau hoàn chỉnh thông qua Docker, toàn bộ cấu hình chạy (`docker-compose.yml`) đã được đặt ở kho lưu trữ **Backend**.

Vui lòng **KHÔNG** chạy riêng lẻ Frontend nếu không cần thiết. Hãy làm theo hướng dẫn dưới đây để chạy toàn bộ hệ thống:

### Bước 1: Clone 2 kho lưu trữ
Hãy tạo một thư mục trống trên máy (ví dụ `Music_CV`), sau đó mở Terminal và clone cả Frontend lẫn Backend vào thư mục đó:

```bash
# Clone Frontend (Thư mục bạn đang xem)
git clone https://github.com/thaithanhtam2004/WebNhac_FE.git

# Clone Backend
git clone https://github.com/thaithanhtam2004/WebNhac_BE.git
```

*(Lưu ý: 2 thư mục `WebNhac_FE` và `WebNhac_BE` bắt buộc phải nằm cạnh nhau)*

### Bước 2: Chạy hệ thống bằng Docker
Mở Terminal, di chuyển vào thư mục **Backend** và chạy Docker:

```bash
cd WebNhac_BE
docker-compose up -d --build
```

### Bước 3: Truy cập trang web
Sau khi Docker báo chạy thành công, giao diện Frontend sẽ tự động phục vụ tại địa chỉ:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🛠 (Tùy chọn) Chạy Frontend độc lập không dùng Docker
Nếu bạn chỉ muốn thiết kế giao diện (UI) và không cần kết nối API, hoặc Backend đã được chạy riêng biệt ở nơi khác, bạn có thể chạy FE thuần túy bằng lệnh:

```bash
npm install
npm run dev
```
