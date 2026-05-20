import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { mapCartItem } from '../utils/mapper.js';

const getShippingFee = () => {
  const fee = process.env.SHIPPING_FEE;
  return fee ? Number(fee) : 0;
};

const ensureCart = async (userId: number) => {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
};

const buildCartResponse = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!cart) {
    return { items: [], summary: { subtotal: 0, shipping: 0, total: 0 } };
  }

  const items = cart.items.map(mapCartItem);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = items.length > 0 ? getShippingFee() : 0;
  const total = subtotal + shipping;

  return {
    items,
    summary: { subtotal, shipping, total },
  };
};

export const getCart = async (userId: number) => {
  await ensureCart(userId);
  return buildCartResponse(userId);
};

export const addCartItem = async (
  userId: number,
  productId: number,
  qty: number
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQty = (existingItem?.qty ?? 0) + qty;

    if (newQty > product.stock) {
      throw createError('Insufficient stock', 400);
    }

    if (existingItem) {
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
      });
      return;
    }

    await tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        qty,
        price: product.price,
      },
    });
  });

  return buildCartResponse(userId);
};

export const updateCartItem = async (
  userId: number,
  itemId: number,
  qty: number
) => {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
    include: {
      product: true,
    },
  });

  if (!item) {
    throw createError('Cart item not found', 404);
  }

  if (qty > item.product.stock) {
    throw createError('Insufficient stock', 400);
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { qty },
  });

  return buildCartResponse(userId);
};

export const removeCartItem = async (userId: number, itemId: number) => {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
  });

  if (!item) {
    throw createError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return buildCartResponse(userId);
};
