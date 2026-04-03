import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Bell, X, Loader2 } from 'lucide-react';
import { useNotifications, useCreateNotification, useUpdateNotification, useDeleteNotification } from '@/hooks/useApi';
import type { Notification, NotificationType } from '@/types';

const typeLabels: Record<NotificationType, { label: string; color: string }> = {
  promotion: { label: 'Khuyến mãi', color: 'bg-warning/10 text-warning border-warning/30' },
  event: { label: 'Sự kiện', color: 'bg-info/10 text-info border-info/30' },
  sale: { label: 'Sale', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  new_product: { label: 'Sản phẩm mới', color: 'bg-success/10 text-success border-success/30' },
};

const NotificationsPage = () => {
  const { data, isLoading, isError } = useNotifications();
  const deleteNotification = useDeleteNotification();
  const [showModal, setShowModal] = useState(false);
  const [editNotif, setEditNotif] = useState<Notification | null>(null);

  const notifications: Notification[] = Array.isArray(data) ? data : data?.data ?? [];

  const openAdd = () => { setEditNotif(null); setShowModal(true); };
  const openEdit = (n: Notification) => { setEditNotif(n); setShowModal(true); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Thông báo</h1>
            <p className="text-sm text-muted-foreground">Quản lý thông báo & khuyến mãi</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Tạo thông báo
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Không thể tải thông báo. Kiểm tra kết nối backend.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    {typeLabels[notif.type] && (
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${typeLabels[notif.type].color}`}>
                        {typeLabels[notif.type].label}
                      </span>
                    )}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${notif.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {notif.isActive ? 'Hoạt động' : 'Tắt'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-card-foreground mb-1">{notif.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{notif.body}</p>

                {notif.discount && (
                  <p className="text-xs font-semibold text-destructive mb-2">Giảm {notif.discount}%</p>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(notif.startAt).toLocaleDateString('vi-VN')}
                    {notif.endAt && ` - ${new Date(notif.endAt).toLocaleDateString('vi-VN')}`}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(notif)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteNotification.mutate(notif._id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <NotificationModal notification={editNotif} onClose={() => setShowModal(false)} />
        )}
      </div>
    </AdminLayout>
  );
};

const NotificationModal = ({ notification, onClose }: { notification: Notification | null; onClose: () => void }) => {
  const isEdit = !!notification;
  const createNotif = useCreateNotification();
  const updateNotif = useUpdateNotification();

  const [form, setForm] = useState({
    title: notification?.title || '',
    body: notification?.body || '',
    type: notification?.type || 'promotion',
    discount: notification?.discount?.toString() || '',
  });

  const handleSubmit = () => {
    const payload = { ...form, discount: form.discount ? Number(form.discount) : null } as Partial<Notification>;
    if (isEdit && notification) {
      updateNotif.mutate({ id: notification._id, data: payload }, { onSuccess: () => onClose() });
    } else {
      createNotif.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  const isSubmitting = createNotif.isPending || updateNotif.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-card-foreground">{isEdit ? 'Sửa thông báo' : 'Tạo thông báo'}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Tiêu đề</label>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nội dung</label>
            <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} rows={3} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Loại</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="promotion">Khuyến mãi</option>
                <option value="event">Sự kiện</option>
                <option value="sale">Sale</option>
                <option value="new_product">Sản phẩm mới</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Giảm giá (%)</label>
              <input type="number" value={form.discount} onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-input bg-background py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">Hủy</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationsPage;
