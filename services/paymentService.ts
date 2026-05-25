import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { getPagination } from '../utils/pagination.js';
import * as uploadService from './uploadService.js';

type ListPaymentsInput = {
  page: number;
  limit: number;
  status?: string;
};

export const uploadProof = async (
  userId: number,
  orderId: number,
  file: Express.Multer.File
) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true },
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (!order.payment) {
    throw createError('Payment not found', 404);
  }

  if (order.payment.status !== 'PENDING') {
    throw createError('Payment cannot be updated', 400);
  }

  const upload = await uploadService.createUpload(userId, file, {
    folder: 'payments',
  });

  const payment = await prisma.payment.update({
    where: { id: order.payment.id },
    data: {
      proofImage: upload.url,
      paidAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'PENDING' },
  });

  return {
    id: String(payment.id),
    status: payment.status,
    proofImage: payment.proofImage,
    paidAt: payment.paidAt,
  };
};

export const listPayments = async (input: ListPaymentsInput) => {
  const { page, limit, status } = input;
  const { skip, take } = getPagination(page, limit);

  const where = status ? { status } : {};

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    }),
  ]);

  return {
    data: payments.map((payment) => ({
      id: String(payment.id),
      orderId: String(payment.orderId),
      method: payment.method,
      status: payment.status,
      proofImage: payment.proofImage ?? null,
      paidAt: payment.paidAt ?? null,
      createdAt: payment.createdAt,
      orderStatus: payment.order.status,
      customer: {
        id: String(payment.order.user.id),
        name: payment.order.user.name,
        email: payment.order.user.email,
      },
    })),
    meta: { page, limit, total },
  };
};

export const getPaymentDetail = async (paymentId: number) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true,
          items: true,
        },
      },
    },
  });

  if (!payment) {
    throw createError('Payment not found', 404);
  }

  return {
    id: String(payment.id),
    orderId: String(payment.orderId),
    method: payment.method,
    status: payment.status,
    proofImage: payment.proofImage ?? null,
    paidAt: payment.paidAt ?? null,
    createdAt: payment.createdAt,
    order: {
      status: payment.order.status,
      total: payment.order.total,
      paymentStatus: payment.order.paymentStatus,
    },
    customer: {
      id: String(payment.order.user.id),
      name: payment.order.user.name,
      email: payment.order.user.email,
    },
    address: payment.order.address
      ? {
          id: String(payment.order.address.id),
          label: payment.order.address.label,
          recipientName: payment.order.address.recipientName,
          phone: payment.order.address.phone,
          addressLine: payment.order.address.addressLine,
          city: payment.order.address.city,
          province: payment.order.address.province,
          postalCode: payment.order.address.postalCode,
        }
      : null,
    items: payment.order.items.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image ?? null,
    })),
  };
};

export const approvePayment = async (paymentId: number) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'PENDING') {
      throw createError('Payment cannot be approved', 400);
    }

    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: payment.paidAt ?? new Date(),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
      },
    });

    return {
      id: String(updated.id),
      status: updated.status,
    };
  });
};

export const rejectPayment = async (paymentId: number) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'PENDING') {
      throw createError('Payment cannot be rejected', 400);
    }

    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'REJECTED' },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REJECTED' },
    });

    return {
      id: String(updated.id),
      status: updated.status,
    };
  });
};

