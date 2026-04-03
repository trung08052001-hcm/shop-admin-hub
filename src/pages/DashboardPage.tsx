import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import StatCard from '@/components/StatCard';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order, OrderStatus } from '@/types';

// Mock data — replace with real API calls when backend admin endpoints are ready
const mockStats = {
  totalUsers: 1243,
  totalProducts: 86,
  totalOrders: 324,
  totalRevenue: 45680000,
};

const mockRecentOrders: Order[] = [
  {
    _id: '1', user: { _id: 'u1', name: 'Nguyễn Văn A', email: 'a@mail.com', avatar: null, role: 'user', createdAt: '', updatedAt: '' },
    items: [{ product: 'p1', name: 'iPhone 15', image: '', price: 25000000, quantity: 1 }],
    totalPrice: 25000000, status: 'pending',
    shippingAddress: { address: '123 Nguyễn Huệ', city: 'HCM', phone: '0901234567' },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: '2', user: { _id: 'u2', name: 'Trần Thị B', email: 'b@mail.com', avatar: null, role: 'user', createdAt: '', updatedAt: '' },
    items: [{ product: 'p2', name: 'AirPods Pro', image: '', price: 5500000, quantity: 2 }],
    totalPrice: 11000000, status: 'processing',
    shippingAddress: { address: '456 Lê Lợi', city: 'HN', phone: '0912345678' },
    createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: '3', user: { _id: 'u3', name: 'Lê Văn C', email: 'c@mail.com', avatar: null, role: 'user', createdAt: '', updatedAt: '' },
    items: [{ product: 'p3', name: 'MacBook Air M2', image: '', price: 28000000, quantity: 1 }],
    totalPrice: 28000000, status: 'delivered',
    shippingAddress: { address: '789 Võ Văn Tần', city: 'HCM', phone: '0923456789' },
    createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: '4', user: { _id: 'u4', name: 'Phạm Thị D', email: 'd@mail.com', avatar: null, role: 'user', createdAt: '', updatedAt: '' },
    items: [{ product: 'p4', name: 'Samsung S24', image: '', price: 22000000, quantity: 1 }],
    totalPrice: 22000000, status: 'shipped',
    shippingAddress: { address: '101 Hai Bà Trưng', city: 'DN', phone: '0934567890' },
    createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date().toISOString(),
  },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const DashboardPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tổng quan hoạt động cửa hàng</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Tổng doanh thu" value={formatCurrency(mockStats.totalRevenue)} icon={DollarSign} variant="primary" trend="+12.5% so với tháng trước" trendUp />
          <StatCard title="Đơn hàng" value={mockStats.totalOrders} icon={ShoppingCart} variant="info" trend="+8 hôm nay" trendUp />
          <StatCard title="Sản phẩm" value={mockStats.totalProducts} icon={Package} variant="success" />
          <StatCard title="Người dùng" value={mockStats.totalUsers} icon={Users} variant="warning" trend="+23 tuần này" trendUp />
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card shadow-card"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">Đơn hàng gần đây</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockRecentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-foreground">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {typeof order.user === 'object' ? order.user.name : order.user}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
