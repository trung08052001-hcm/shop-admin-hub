import axios from 'axios';
import type { Product, Order, User, Notification, OrderStatus, Review, ChatRoom, ChatMessage } from '@/types';

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

export default api;
