import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, orderApi, userApi, notificationApi, dashboardApi, authApi } from '@/services/api';
import type { Product, Order, OrderStatus, Notification } from '@/types';
import { toast } from 'sonner';

// ─── Auth ────────────────────────────────────────────
export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
  });
};

// ─── Dashboard ───────────────────────────────────────
export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
    retry: 1,
  });

// ─── Products ────────────────────────────────────────
export const useProducts = (page = 1, limit = 10, search?: string, category?: string) =>
  useQuery({
    queryKey: ['products', page, limit, search, category],
    queryFn: () => productApi.getAll(page, limit, search, category).then((r) => r.data),
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => productApi.create(data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Tạo sản phẩm thành công'); },
    onError: () => toast.error('Lỗi khi tạo sản phẩm'),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productApi.update(id, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Cập nhật sản phẩm thành công'); },
    onError: () => toast.error('Lỗi khi cập nhật sản phẩm'),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Xóa sản phẩm thành công'); },
    onError: () => toast.error('Lỗi khi xóa sản phẩm'),
  });
};

// ─── Orders ──────────────────────────────────────────
export const useOrders = (page = 1, limit = 10, status?: string) =>
  useQuery({
    queryKey: ['orders', page, limit, status],
    queryFn: () => orderApi.getAll(page, limit, status === 'all' ? undefined : status).then((r) => r.data),
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast.success('Cập nhật trạng thái thành công'); },
    onError: () => toast.error('Lỗi khi cập nhật trạng thái'),
  });
};

// ─── Users ───────────────────────────────────────────
export const useUsers = (page = 1, limit = 10, search?: string) =>
  useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: () => userApi.getAll(page, limit, search).then((r) => r.data),
  });

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Xóa người dùng thành công'); },
    onError: () => toast.error('Lỗi khi xóa người dùng'),
  });
};

// ─── Notifications ───────────────────────────────────
export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then((r) => r.data),
  });

export const useCreateNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Notification>) => notificationApi.create(data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Tạo thông báo thành công'); },
    onError: () => toast.error('Lỗi khi tạo thông báo'),
  });
};

export const useUpdateNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Notification> }) => notificationApi.update(id, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Cập nhật thông báo thành công'); },
    onError: () => toast.error('Lỗi khi cập nhật thông báo'),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Xóa thông báo thành công'); },
    onError: () => toast.error('Lỗi khi xóa thông báo'),
  });
};
