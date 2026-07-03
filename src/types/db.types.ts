import { Product } from "./product.types";
import { BlogPost } from "./blog.types";

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderLog {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    sku: string;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMethod: "VIETQR" | "BANK_TRANSFER" | "COD";
  shippingAddress: {
    name: string;
    phone: string;
    detail: string;
    area: string;
  };
  trackingLogs: { time: string; title: string; desc: string }[];
  createdAt: string;
}

export interface DatabaseSchema {
  products: Product[];
  reviews: ProductReview[];
  blogs: BlogPost[];
  orders: OrderLog[];
}