import axios from 'axios';
import type { Product, Order, User, Notification, OrderStatus, Review, ChatRoom, ChatMessage, Recruitment, RecruitmentStatus } from '@/types';

// Configure this to point to your Express.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token on 401 error
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = data.accessToken;
        
        localStorage.setItem('admin_token', newToken);
        if (data.refreshToken) {
          localStorage.setItem('admin_refresh_token', data.refreshToken);
        }
        
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
};

// ─── Products ────────────────────────────────────────
export const productApi = {
  getAll: (page = 1, limit = 10, search?: string, category?: string) =>
    api.get('/products', { params: { page, limit, search, category } }),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getCategories: () => api.get<string[]>('/products/categories'),
};

// ─── Orders ──────────────────────────────────────────
export const orderApi = {
  getAll: (page = 1, limit = 10, status?: string) =>
    api.get('/orders/all', { params: { page, limit, status } }),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    api.put<Order>(`/orders/${id}/status`, { status }),
};

// ─── Users ───────────────────────────────────────────
export const userApi = {
  getAll: (page = 1, limit = 10, search?: string) =>
    api.get('/users', { params: { page, limit, search } }),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ─── Notifications ───────────────────────────────────
export const notificationApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  create: (data: Partial<Notification>) => api.post<Notification>('/notifications', data),
  update: (id: string, data: Partial<Notification>) => api.put<Notification>(`/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ─── Dashboard Stats (mock aggregation — add a real endpoint on your backend) ─
export const dashboardApi = {
  getStats: () => api.get('/admin/stats'),
};

// ─── Reviews ─────────────────────────────────────────
export const reviewApi = {
  getAll: () => api.get<Review[]>('/reviews'),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ─── Chat ───────────────────────────────────────────
export const chatApi = {
  getRooms: () =>
    api.get<{ success: boolean; data: ChatRoom[] }>('/chat/rooms').then(res => res.data.data),
  getMessages: (roomId: string) =>
    api.get<{ success: boolean; data: ChatMessage[] }>(`/chat/rooms/${roomId}/messages`).then(res => res.data.data),
  markAsRead: (roomId: string) => api.put(`/chat/rooms/${roomId}/read-admin`),
};

// ─── Recruitment ─────────────────────────────────────
export const recruitmentApi = {
  getAll: () => api.get<{ success: boolean; data: Recruitment[] }>('/recruitment'),
  updateStatus: (id: string, status: RecruitmentStatus) =>
    api.put<{ success: boolean; data: Recruitment }>(`/recruitment/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/recruitment/${id}`),
};

export default api;
