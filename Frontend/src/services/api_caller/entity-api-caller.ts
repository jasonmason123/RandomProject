import { BaseEntity } from "@app/class/entities";
import { PagedListResult } from "@app/types/dtos";
import { BaseQueryParams } from "@app/types/query-params";
import { API_HOST_AND_PORT, toQueryString } from "@app/utils/common";

export async function fetchItems<T extends BaseEntity<string | number>>(
  queryParams: BaseQueryParams,
  apiControllerName: string,
): Promise<PagedListResult<T>> {
  const queryString = toQueryString(queryParams);

  const response = await fetch(`${API_HOST_AND_PORT}/api/${apiControllerName}/list?${queryString}`, {
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

export async function fetchItemById<T extends BaseEntity<string | number>>(
  id: string | number,
  apiControllerName: string,
): Promise<T> {
  const response = await fetch(`${API_HOST_AND_PORT}/api/${apiControllerName}/${id}`, {
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

export async function addItem<T extends BaseEntity<string | number>>(
  item: T,
  apiControllerName: string,
): Promise<T> {
  const response = await fetch(`${API_HOST_AND_PORT}/api/${apiControllerName}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function updateItem<T extends BaseEntity<string | number>>(
  id: string | number,
  item: T,
  apiControllerName: string,
): Promise<T> {
  const response = await fetch(`${API_HOST_AND_PORT}/api/${apiControllerName}/update/${id}`, {  
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteItem(
  id: string | number,
  apiControllerName: string,
): Promise<void> {
  const response = await fetch(`${API_HOST_AND_PORT}/api/${apiControllerName}/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }
}