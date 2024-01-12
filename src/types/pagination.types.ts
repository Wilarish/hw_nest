export enum SortDirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export class DefaultPaginationType {
  constructor(
    public sortBy: string,
    public sortDirection: SortDirectionEnum,
    public pageNumber: number,
    public pageSize: number,
    public skip: number,
  ) {}
}

export type BlogsPaginationType = DefaultPaginationType & {
  searchNameTerm: string;
};

export type UsersPaginationType = DefaultPaginationType & {
  searchLoginTerm: string;
  searchEmailTerm: string;
};

export type Paginated<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};
