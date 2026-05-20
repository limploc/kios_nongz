export const getPagination = (page: number, limit: number) => {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};
