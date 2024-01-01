import { InfinityPaginationResultType } from './types/infinity-pagination-result.type';

export type DatePagination<T> = {
  data: T[];
  total?: number;
};

export const infinityPagination = <T>(
  data: DatePagination<T>,
  options: IPaginationOptions,
): InfinityPaginationResultType<T> => {
  return {
    data: data.data,
    hasNextPage: data.data.length === options.limit,
    total: data?.total,
  };
};
