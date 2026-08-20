export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'INVENTORY_MANAGER' | 'SALES_MANAGER';
  avatarUrl?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  division?: string;
  district?: string;
  upazila?: string;
  address?: string;
  avatarUrl?: string;
  createdAt?: string;
  addresses?: Address[];
  stats?: {
    totalOrders: number;
    pendingOrders?: number;
    completedOrders?: number;
    totalSpent: number;
    avgOrderValue?: number;
    lastOrderDate?: string;
  };
}

export interface Address {
  id: string;
  customerId: string;
  title: string;
  receiverName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  areaAddress: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  displayOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  isFeatured: boolean;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  color?: string;
  colorCode?: string;
  storage?: string;
  ram?: string;
  sku: string;
  purchasePrice: number;
  regularPrice: number;
  discountPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customer?: { fullName: string; avatarUrl?: string };
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brandId: string;
  brand: Brand;
  categoryId: string;
  category: Category;
  shortDesc?: string;
  description?: string;
  specifications?: string; // JSON string or object
  warranty?: string;
  regularPrice: number;
  discountPrice?: number;
  purchasePrice: number;
  stockQuantity: number;
  minStockLevel: number;
  mainImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  ratingCount: number;
  createdAt: string;
  variants: ProductVariant[];
  images?: ProductImage[];
  reviews?: Review[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  productName: string;
  variantName?: string;
  sku: string;
  unitPrice: number;
  purchaseCost: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  upazila: string;
  shippingAddress: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  deliveryFee: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'BKASH' | 'NAGAD' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  senderPhone?: string;
  paidAt?: string;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  adminNotes?: string;
  estimatedDelivery?: string;
  createdAt: string;
  items: OrderItem[];
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order?: Order;
  customerId?: string;
  customer?: Customer;
  issueDate: string;
  dueDate?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  vat: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  terms?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  product: { name: string; sku: string; mainImage: string };
  variantId?: string;
  variant?: { name: string; sku: string };
  orderId?: string;
  order?: { orderNumber: string };
  type: string;
  prevQty: number;
  changeQty: number;
  newQty: number;
  unitCost?: number;
  reason?: string;
  actor?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  _count?: { purchases: number };
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplier: Supplier;
  referenceNo?: string;
  purchaseDate: string;
  totalAmount: number;
  notes?: string;
  status: string;
  items: PurchaseItem[];
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
