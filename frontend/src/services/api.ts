export const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://127.0.0.1:3000";

type Json = Record<string, any>;

export async function apiPost<TResponse>(
  path: string,
  body: Json,
  token?: string
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.message?.toString?.() ||
      data?.error?.toString?.() ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as TResponse;
}

export async function apiGet<TResponse>(
  path: string,
  token?: string
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.message?.toString?.() ||
      data?.error?.toString?.() ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as TResponse;
}
