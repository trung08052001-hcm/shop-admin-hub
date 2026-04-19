// Types matching the Express.js/MongoDB backend models

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type RecruitmentStatus = 'pending' | 'reviewed' | 'interviewing' | 'accepted' | 'rejected';

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: {
    address: string;
    city: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'promotion' | 'event' | 'sale' | 'new_product';

export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: NotificationType;
  discount: number | null;
  imageUrl: string | null;
  isActive: boolean;
  startAt: string;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalRecruitments: number;
  recentOrders: Order[];
  ordersByStatus: Record<OrderStatus, number>;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string };
  product: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Chat ───────────────────────────────────────────

export interface ChatMessage {
  _id: string;
  room: string;
  sender: string;
  senderModel: 'User' | 'Admin';
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  _id: string;
  user: User;
  lastMessage?: string;
  unreadCountAdmin: number;
  unreadCountUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recruitment {
  _id: string;
  userEmail: string;
  jobTitle: string;
  cvPath: string;
  status: RecruitmentStatus;
  createdAt: string;
  updatedAt: string;
}
