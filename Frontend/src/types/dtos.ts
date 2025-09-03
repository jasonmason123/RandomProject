export interface AuthenticationResult {
  succeeded: boolean;
  isLockedOut: boolean;
  isEmailConfirmed: boolean;
  confirmationToken?: string;
}

export interface UserInfo {
  username: string;
  email: string;
  dateJoined: string;
}

export interface PagedListResult<T extends any> {
  totalItemCount: number;
  pageCount: number;
  pageSize: number;
  pageNumber: number;
  items: T[];
}