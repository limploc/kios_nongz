import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { getPagination } from '../utils/pagination.js';
import { mapOrder, mapOrderDetail } from '../utils/mapper.js';

type CheckoutInput = {
  addressId: number;
  paymentMethod: string;
  notes?: string;
};

type ListOrdersInput = {
  page: number;
  limit: number;
  status?: string;
};

const getShippingFee = () => {
  const fee = process.env.SHIPPING_FEE;
  return fee ? Number(fee) : 0;
};

export const checkout = async (userId: number, input: CheckoutInput) => {
  const { addressId, paymentMethod, notes } = input;

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw createError('Address not found', 404);
    }

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { isPrimary: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw createError('Cart is empty', 400);
    }

    for (const item of cart.items) {
      if (item.qty > item.product.stock) {
        throw createError('Insufficient stock', 400);
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const shipping = getShippingFee();
    const total = subtotal + shipping;

    const createdOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        status: 'PENDING',
        subtotal,
        shipping,
        total,
        paymentMethod,
        paymentStatus: 'PENDING',
        paymentAmount: total,
        notes: notes ?? null,
      },
    });

    await tx.payment.create({
      data: {
        orderId: createdOrder.id,
        method: paymentMethod,
        status: 'PENDING',
      },
    });

    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        name: item.product.name,
        qty: item.qty,
        price: item.price,
        image: item.product.images[0]?.url ?? null,
      })),
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return createdOrder;
  });

  return {
    orderId: String(order.id),
    status: order.status,
    payment: {
      method: order.paymentMethod,
      status: order.paymentStatus,
      amount: order.paymentAmount,
    },
  };
};

export const listOrders = async (userId: number, input: ListOrdersInput) => {
  const { page, limit, status } = input;
  const { skip, take } = getPagination(page, limit);

  const where = {
    userId,
    ...(status ? { status } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return {
    data: orders.map(mapOrder),
    meta: { page, limit, total },
  };
};

export const getOrderDetail = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  return mapOrderDetail(order);
};
