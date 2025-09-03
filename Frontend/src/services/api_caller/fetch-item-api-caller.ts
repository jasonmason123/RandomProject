import { BaseEntity } from "@app/class/entities";
import { PagedListResult } from "@app/types/dtos";
import { BaseQueryParams } from "@app/types/query-params";
import { toQueryString } from "@app/utils/common";

export async function fetchItems<T extends BaseEntity>(
  ctor: { new (): T },
  queryParams: BaseQueryParams
): Promise<PagedListResult<T>> {
  const typeName = ctor.name.toLowerCase();
  const queryString = toQueryString(queryParams);

  const response = await fetch(`/api/${typeName}?${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }

  return await response.json();
}