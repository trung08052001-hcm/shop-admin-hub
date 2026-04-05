# 🛒 Shop Admin Hub

Web dashboard quản lý hệ thống e-commerce, xây dựng bằng ReactJS + Ant Design.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5-0170FE?style=flat&logo=antdesign)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📸 Screenshots

| Dashboard | Sản phẩm | Đơn hàng |
|-----------|----------|----------|
| Thống kê tổng quan + biểu đồ | Thêm/Sửa/Xoá sản phẩm | Cập nhật trạng thái đơn |

---

## ✨ Tính năng

### 📊 Dashboard
- Thống kê tổng quan: sản phẩm, đơn hàng, users, doanh thu
- Biểu đồ doanh thu 7 ngày (Line chart)
- Biểu đồ đơn hàng theo trạng thái (Bar chart)
- Bảng đơn hàng gần đây

### 🛍️ Quản lý sản phẩm
- Danh sách sản phẩm với ảnh, giá, tồn kho
- Thêm sản phẩm mới
- Sửa thông tin sản phẩm
- Xoá sản phẩm

### 📦 Quản lý đơn hàng
- Xem tất cả đơn hàng của hệ thống
- Xem chi tiết từng đơn (expand row)
- Cập nhật trạng thái: Chờ xử lý → Đang xử lý → Đang giao → Đã giao

### 👥 Quản lý Users
- Danh sách tài khoản với avatar
- Đổi role: User ↔ Admin

### 🎟️ Quản lý Coupon
- Tạo mã giảm giá theo % hoặc số tiền cố định
- Cài giới hạn lượt dùng, ngày hết hạn, đơn tối thiểu
- Bật/tắt coupon

---

## 🛠️ Tech Stack

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | 18 | UI Framework |
| Vite | 5 | Build tool |
| Ant Design | 5 | UI Components |
| Axios | 1.x | HTTP Client |
| React Router | 6 | Navigation |
| Recharts | 2.x | Charts |
| Day.js | - | Date handling |

---

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js >= 18
- Backend API đang chạy (xem [shop-app-backend](https://github.com/trung08052001-hcm/shop-app-backend))

### Cài đặt
```bash
