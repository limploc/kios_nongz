import prisma from '../config/prisma.js';
import { mapCategory } from '../utils/mapper.js';

export const listCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return categories.map(mapCategory);
};
