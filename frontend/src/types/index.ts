// Tipos TypeScript baseados no schema Prisma

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  type: 'BOOK' | 'STATIONERY' | 'OTHER';
  price: number;
  cost?: number;
  comparePrice?: number;
  stock: number;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'ACCEPTABLE';
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  isbn10?: string;
  isbn13?: string;
  author?: string;
  publisher?: string;
  year?: number;
  pages?: number;
  language: string;
  featured: boolean;
  active: boolean;
  images: string[];
  category?: Category;
  categoryId: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: Address;
}

export interface Payment {
  id: string;
  method: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: number;
  pixCode?: string;
  pixQrCode?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  clientSecret?: string;
}

export interface CheckoutData {
  items: { productId: string; quantity: number }[];
  addressId: string;
  customerNote?: string;
}

export interface AuthContext {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
