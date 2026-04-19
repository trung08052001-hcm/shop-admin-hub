import AdminLayout from '@/components/AdminLayout';
import StatCard from '@/components/StatCard';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardStats } from '@/hooks/useApi';
import type { Order } from '@/types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const DashboardPage = () => {
  const { data: stats, isLoading, isError } = useDashboardStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tổng quan hoạt động cửa hàng</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Không thể tải dữ liệu. Hãy kiểm tra kết nối đến backend.</p>
          </div>
        )}

        {stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard title="Tổng doanh thu" value={formatCurrency(stats.totalRevenue ?? 0)} icon={DollarSign} variant="primary" />
              <StatCard title="Đơn hàng" value={stats.totalOrders ?? 0} icon={ShoppingCart} variant="info" />
              <StatCard title="Sản phẩm" value={stats.totalProducts ?? 0} icon={Package} variant="success" />
              <StatCard title="Người dùng" value={stats.totalUsers ?? 0} icon={Users} variant="warning" />
              <StatCard title="Ứng viên" value={stats.totalRecruitments ?? 0} icon={UserPlus} variant="primary" />
            </div>

            {stats.recentOrders && stats.recentOrders.length > 0 && (
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
                      {stats.recentOrders.map((order: Order) => (
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
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
