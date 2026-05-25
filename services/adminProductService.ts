import type { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { mapProduct, mapProductDetail } from '../utils/mapper.js';
import { getPagination } from '../utils/pagination.js';
import * as uploadService from './uploadService.js';

type ProductInput = {
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
};

type ProductUpdateInput = Partial<ProductInput>;

type ImageInput = {
  url: string;
  isPrimary?: boolean;
};

type ListProductsInput = {
  page: number;
  limit: number;
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'createdAt' | 'name';
  order?: 'asc' | 'desc';
};

const buildOrderBy = (sort?: string, order?: string) => {
  const sortField = sort === 'price' || sort === 'name' ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  return { [sortField]: sortOrder } as Prisma.ProductOrderByWithRelationInput;
};

export const listProducts = async (params: ListProductsInput) => {
  const { page, limit, q, categoryId, minPrice, maxPrice, sort, order } = params;
  const { skip, take } = getPagination(page, limit);

  const where: Prisma.ProductWhereInput = {};

  if (q) {
    where.name = { contains: q };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: buildOrderBy(sort, order),
      include: {
        images: {
          orderBy: { isPrimary: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  return {
    data: products.map(mapProduct),
    meta: { page, limit, total },
  };
};

export const createProduct = async (input: ProductInput) => {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  const product = await prisma.product.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      stock: input.stock,
    },
    include: {
      images: true,
      category: true,
    },
  });

  return mapProductDetail(product);
};

export const updateProduct = async (id: number, input: ProductUpdateInput) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw createError('Category not found', 404);
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      categoryId: input.categoryId ?? product.categoryId,
      name: input.name ?? product.name,
      description: input.description ?? product.description,
      price: input.price ?? product.price,
      stock: input.stock ?? product.stock,
    },
    include: { images: { orderBy: { isPrimary: 'desc' } }, category: true },
  });

  return mapProductDetail(updated);
};

export const deleteProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  await prisma.productImage.deleteMany({
    where: { productId: id },
  });
  await prisma.cartItem.deleteMany({
    where: { productId: id },
  });
  await prisma.wishlist.deleteMany({
    where: { productId: id },
  });

  const deleted = await prisma.product.delete({
    where: { id },
    include: { images: true },
  });

  return mapProduct({ ...deleted, images: deleted.images });
};

export const addProductImage = async (productId: number, input: ImageInput) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  if (input.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  const image = await prisma.productImage.create({
    data: {
      productId,
      url: input.url,
      isPrimary: input.isPrimary ?? false,
    },
  });

  return {
    id: String(image.id),
    url: image.url,
    isPrimary: image.isPrimary,
  };
};

export const updateProductImage = async (
  productId: number,
  imageId: number,
  input: Partial<ImageInput>
) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });

  if (!image) {
    throw createError('Image not found', 404);
  }

  if (input.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: {
      url: input.url ?? image.url,
      isPrimary: input.isPrimary ?? image.isPrimary,
    },
  });

  return {
    id: String(updated.id),
    url: updated.url,
    isPrimary: updated.isPrimary,
  };
};

export const deleteProductImage = async (productId: number, imageId: number) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });

  if (!image) {
    throw createError('Image not found', 404);
  }

  await prisma.productImage.delete({
    where: { id: imageId },
  });

  return { id: String(imageId) };
};

export const addProductImageFromFile = async (
  productId: number,
  userId: number,
  file: Express.Multer.File,
  isPrimary?: boolean
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  const upload = await uploadService.createUpload(userId, file, {
    folder: 'products',
  });

  const image = await prisma.productImage.create({
    data: {
      productId,
      url: upload.url,
      isPrimary: isPrimary ?? false,
    },
  });

  return {
    id: String(image.id),
    url: image.url,
    isPrimary: image.isPrimary,
  };
};
