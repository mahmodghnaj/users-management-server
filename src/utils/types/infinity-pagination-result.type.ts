export type InfinityPaginationResultType<T> = Readonly<{
  data: T[];
  total?: number;
  hasNextPage: boolean;
}>;
