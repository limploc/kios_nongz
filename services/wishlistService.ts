import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { mapProduct } from '../utils/mapper.js';

const getWishlistProducts = async (userId: number) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
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
  });

  return items.map((item) => mapProduct(item.product));
};

export const getWishlist = async (userId: number) => {
  return getWishlistProducts(userId);
};

export const addWishlistItem = async (userId: number, productId: number) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  await prisma.wishlist.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    update: {},
    create: { userId, productId },
  });

  return getWishlistProducts(userId);
};

export const removeWishlistItem = async (userId: number, productId: number) => {
  await prisma.wishlist.deleteMany({
    where: { userId, productId },
  });

  return getWishlistProducts(userId);
};
