export interface SortBy {
  property: string;
  order: "asc" | "desc";
}

export interface BaseQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: SortBy;
}