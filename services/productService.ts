import type { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { getPagination } from '../utils/pagination.js';
import { mapProduct, mapProductDetail } from '../utils/mapper.js';
import { createError } from '../utils/errors.js';

type ListProductsParams = {
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

export const listProducts = async (params: ListProductsParams) => {
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
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const getProductDetail = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { isPrimary: 'desc' },
      },
      category: true,
    },
  });

  if (!product) {
    throw createError('Product not found', 404);
  }

  return mapProductDetail(product);
};
