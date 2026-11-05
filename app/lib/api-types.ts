export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  /** Thumbnail resolution (~150 x 150). Derived from `url` when absent. */
  thumbnailUrl?: string;
  /** Main image resolution (~800 x 800). Derived from `url` when absent. */
  mediumUrl?: string;
  /** Original resolution for the zoom panel (~1600 x 1600+). Derived from `url` when absent. */
  originalUrl?: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
  } | null;
  createdAt: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceAdjustment: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInventory = {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  reservedQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  isActive: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
  dimensions: Record<string, unknown> | null;
  category?: Category | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  inventory?: ProductInventory[];
  reviews?: ProductReview[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProductsResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
};

/** An order of the signed in customer, the amounts are in minor units. */
export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items?: {
    id: string;
    quantity: number;
    product?: { name: string; slug: string } | null;
  }[];
};

export type PaginatedOrdersResponse = {
  data: CustomerOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/** A single line of the shopping cart, the price is a snapshot in minor units. */
export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  availableStock?: number;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    images?: ProductImage[];
    variants?: ProductVariant[];
  } | null;
  variant?: ProductVariant | null;
};

/** The cart of the signed in customer. */
export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  summary: {
    subtotal: number;
    currency: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

/** A single line of the wishlist. */
export type WishlistItem = {
  id: string;
  wishlistId: string;
  productId: string;
  createdAt?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    images?: ProductImage[];
  } | null;
};

/** The wishlist of the signed in customer. */
export type Wishlist = {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt?: string;
  updatedAt?: string;
};
