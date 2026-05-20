import type {
  Address,
  Category,
  Order,
  OrderItem,
  Product,
  ProductImage,
} from '@prisma/client';

type ProductWithImages = Product & { images: ProductImage[] };

type ProductWithImagesAndCategory = ProductWithImages & {
  category: Category;
};

type CartItemProduct = {
  id: number;
  name: string;
};

type CartItemRecord = {
  id: number;
  productId: number;
  qty: number;
  price: number;
  product: CartItemProduct;
};

type OrderWithItems = Order & { items: OrderItem[] };

export const mapCategory = (category: Category) => ({
  id: String(category.id),
  name: category.name,
  iconUrl: category.iconUrl,
});

export const mapProduct = (product: ProductWithImages) => ({
  id: String(product.id),
  name: product.name,
  price: product.price,
  stock: product.stock,
  image: product.images[0]?.url ?? null,
});

export const mapProductDetail = (product: ProductWithImagesAndCategory) => ({
  id: String(product.id),
  name: product.name,
  description: product.description ?? null,
  price: product.price,
  stock: product.stock,
  images: product.images.map((image) => image.url),
  category: mapCategory(product.category),
});

export const mapCartItem = (item: CartItemRecord) => ({
  id: String(item.id),
  productId: String(item.productId),
  name: item.product.name,
  qty: item.qty,
  price: item.price,
});

export const mapOrder = (order: Order) => ({
  id: String(order.id),
  status: order.status,
  total: order.total,
  createdAt: order.createdAt,
});

export const mapOrderDetail = (order: OrderWithItems) => ({
  id: String(order.id),
  status: order.status,
  items: order.items.map((item) => ({
    name: item.name,
    qty: item.qty,
    price: item.price,
  })),
  payment: {
    method: order.paymentMethod,
    status: order.paymentStatus,
    amount: order.paymentAmount,
  },
  shipment: {
    courier: order.shipmentCourier ?? null,
    trackingNumber: order.shipmentTrackingNumber ?? null,
    status: order.shipmentStatus ?? null,
  },
});

export const mapAddress = (address: Address) => ({
  id: String(address.id),
  label: address.label,
  recipientName: address.recipientName,
  phone: address.phone,
  addressLine: address.addressLine,
  city: address.city,
  province: address.province,
  postalCode: address.postalCode,
  isDefault: address.isDefault,
});
