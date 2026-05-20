import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { mapCategory } from '../utils/mapper.js';

type CategoryInput = {
  name: string;
  iconUrl?: string | null;
};

export const createCategory = async (input: CategoryInput) => {
  const category = await prisma.category.create({
    data: {
      name: input.name,
      iconUrl: input.iconUrl ?? null,
    },
  });

  return mapCategory(category);
};

export const listCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return categories.map(mapCategory);
};

export const updateCategory = async (id: number, input: Partial<CategoryInput>) => {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw createError('Category not found', 404);
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      iconUrl: input.iconUrl ?? existing.iconUrl,
    },
  });

  return mapCategory(category);
};

export const deleteCategory = async (id: number) => {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw createError('Category not found', 404);
  }

  const category = await prisma.category.delete({
    where: { id },
  });

  return mapCategory(category);
};
