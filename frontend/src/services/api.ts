export const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:3000";

type Json = Record<string, any>;

export async function apiPost<TResponse>(
  path: string,
  body: Json,
  init?: RequestInit
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
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
