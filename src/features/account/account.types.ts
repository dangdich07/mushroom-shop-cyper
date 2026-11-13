export interface AccountOrder {
  id: string;
  createdAt: string;
  status: string;
  grandTotal: number;
  productName: string;
}

export interface AccountNotification {
  id: string;
  time: string;
  title: string;
  desc: string;
}

export interface AccountProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  labPosition: string;
  avatarUrl: string;
}

export interface AccountAddress {
  id: string;
  name: string;
  phone: string;
  area: string;
  detail: string;
}

export interface AccountDashboardData {
  orders: AccountOrder[];
  loyaltyPoints: number;
  totalSpent: number;
}
