import { SortOrder } from "./enums";

export interface BaseQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortProperty?: string;
  sortOrder?: SortOrder;
}

export interface ProductQueryParams extends BaseQueryParams {}