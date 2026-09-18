export interface AdminDashboardOrder {
  id: string;
  shippingName: string;
  grandTotal: number;
  status: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: AdminDashboardOrder[];
}

