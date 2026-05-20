import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { getPagination } from '../utils/pagination.js';

const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;

type ListOrdersInput = {
  page: number;
  limit: number;
  status?: string;
};

export const listOrders = async (input: ListOrdersInput) => {
  const { page, limit, status } = input;
  const { skip, take } = getPagination(page, limit);

  const where = status ? { status } : {};

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    data: orders.map((order) => ({
      id: String(order.id),
      status: order.status,
      total: order.total,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      user: {
        id: String(order.user.id),
        name: order.user.name,
        email: order.user.email,
      },
    })),
    meta: { page, limit, total },
  };
};

export const getOrderDetail = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
      address: true,
      payment: true,
    },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  return {
    id: String(order.id),
    status: order.status,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    payment: {
      method: order.paymentMethod,
      status: order.paymentStatus,
      amount: order.paymentAmount,
      proofImage: order.payment?.proofImage ?? null,
      paidAt: order.payment?.paidAt ?? null,
    },
    shipment: {
      courier: order.shipmentCourier ?? null,
      trackingNumber: order.shipmentTrackingNumber ?? null,
      status: order.shipmentStatus ?? null,
    },
    customer: {
      id: String(order.user.id),
      name: order.user.name,
      email: order.user.email,
    },
    address: order.address
      ? {
          id: String(order.address.id),
          label: order.address.label,
          recipientName: order.address.recipientName,
          phone: order.address.phone,
          addressLine: order.address.addressLine,
          city: order.address.city,
          province: order.address.province,
          postalCode: order.address.postalCode,
        }
      : null,
    items: order.items.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image ?? null,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw createError('Invalid status', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return {
    id: String(updated.id),
    status: updated.status,
  };
};
