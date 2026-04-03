import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { motion } from 'framer-motion';
import { Eye, X, Loader2 } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useApi';
import type { Order, OrderStatus } from '@/types';

const statuses: (OrderStatus | 'all')[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
  all: 'Tất cả', pending: 'Chờ xử lý', processing: 'Đang xử lý',
  shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const OrdersPage = () => {
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, isError } = useOrders(page, 10, activeStatus);

  const orders: Order[] = data?.data ?? data?.orders ?? (Array.isArray(data) ? data : []);
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">Quản lý và theo dõi đơn hàng</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setActiveStatus(s); setPage(1); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeStatus === s
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Không thể tải đơn hàng. Kiểm tra kết nối backend.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã đơn</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày đặt</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-foreground">#{order._id.slice(-6)}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{typeof order.user === 'object' ? order.user.name : ''}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{order.items.map(i => i.name).join(', ')}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatCurrency(order.totalPrice)}</td>
                        <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedOrder(order)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border px-3 py-1.5 text-sm text-foreground disabled:opacity-40">Trước</button>
                <span className="text-sm text-muted-foreground">Trang {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border px-3 py-1.5 text-sm text-foreground disabled:opacity-40">Sau</button>
              </div>
            )}
          </>
        )}

        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </div>
    </AdminLayout>
  );
};

const OrderDetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const updateStatus = useUpdateOrderStatus();
  const user = typeof order.user === 'object' ? order.user : null;

  const handleSave = () => {
    updateStatus.mutate({ id: order._id, status }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-elevated max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-card-foreground">Đơn hàng #{order._id.slice(-6)}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          {user && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-4 space-y-1">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Địa chỉ giao hàng</p>
            <p className="text-sm text-foreground">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
            <p className="text-sm text-muted-foreground">SĐT: {order.shippingAddress.phone}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Sản phẩm</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-sm font-semibold text-foreground">Tổng cộng</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(order.totalPrice)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cập nhật trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>

          <button onClick={handleSave} disabled={updateStatus.isPending} className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {updateStatus.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersPage;
