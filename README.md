# 🐾 Hành Trình Của Gấu - Workshop Game

Game giải đố ô chữ tương tác bảo tồn loài gấu Việt Nam (Gấu Chó & Gấu Ngựa) dành cho sự kiện / workshop ngắn hạn, tích hợp cơ chế Session tạm thời (giống Kahoot) và Bảng Xếp Hạng qua Supabase.

---

## 🚀 Tính năng nổi bật
* **Không cần đăng nhập Auth:** Người chơi chỉ cần nhập nickname và chọn linh vật gấu đại diện để bắt đầu.
* **Cơ chế Session (Phiên chơi) chống mất điểm:** Vô tình F5 (Reload), vuốt thoát trình duyệt trên mobile hoặc mất mạng chập chờn đều không làm mất màn hình hay điểm số.
* **Hệ thống tính điểm thi đấu:**
  * Điểm chuẩn: +100đ mỗi trạm.
  * Thưởng tốc độ (Speed bonus): Giải nhanh trong 10s đầu (+30đ), trong 20s (+15đ).
  * Thưởng không dùng gợi ý: +20đ.
* **Bảng Xếp Hạng (Leaderboard) thời gian thực:** Đồng bộ điểm lên Supabase `bear_leaderboard`.
* **Quản lý câu hỏi linh hoạt:** Toàn bộ câu hỏi, đáp án, kiến thức trạm lưu tại bảng `bear_levels` trên Supabase (dễ dàng chỉnh sửa trực tiếp trên Supabase Dashboard).

---

## 🛠️ Cài đặt & Chạy Local

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Cấu hình môi trường (.env):**
Tạo file `.env` từ `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

3. **Khởi chạy ứng dụng:**
```bash
npm run dev
```

4. **Kiểm tra build:**
```bash
npm run build
```

---

## 🌐 Hướng dẫn Deploy nhanh (Vercel / Netlify)

### 1. Đưa code lên GitHub / GitLab:
```bash
git init
git add .
git commit -m "feat: initial bear game release"
git branch -M main
git remote add origin <URL_REPO_CUA_BAN>
git push -u origin main
```

### 2. Deploy lên Vercel:
1. Truy cập [vercel.com](https://vercel.com) -> **Add New Project** -> Chọn Git repository vừa tạo.
2. Tại mục **Environment Variables**, thêm 2 biến:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
3. Bấm **Deploy**. Sau 1 phút bạn sẽ có đường link web công khai để gửi cho người chơi!

### 3. Deploy lên Netlify:
1. Truy cập [netlify.com](https://netlify.com) -> **Import from Git**.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Cấu hình Environment Variables tương tự như trên.
