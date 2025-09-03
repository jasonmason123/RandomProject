import { UserInfo } from "@app/types/dtos";

export function checkStrongPassword(password: string) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial
  );
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getUserInfo(): UserInfo | null {
  const userInfoBase64 = getCookie("userInfo");
  if (!userInfoBase64) return null;

  try {
    const json = atob(userInfoBase64);
    const info = JSON.parse(json);
    return {
      username: info.username,
      email: info.email,
      dateJoined: info.dateJoined
    }
  } catch (err) {
    console.error("Failed to parse userInfo:", err);
    return null;
  }
}

export function toQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      // handle arrays (like sortBy)
      value.forEach(v => {
        if (typeof v === "object") {
          query.append(key, JSON.stringify(v));
        } else {
          query.append(key, String(v));
        }
      });
    } else if (typeof value === "object") {
      query.append(key, JSON.stringify(value));
    } else {
      query.append(key, String(value));
    }
  });

  return query.toString();
}