import { apiPost } from "./api";

export type RegisterPayload = {
  username: string;
  password: string;
  fullname: string;
  email: string;
  dateofbirth?: string; // "YYYY-MM-DD"
  phone: string;
  image: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  info: any;
};

export function register(payload: RegisterPayload) {
  return apiPost<AuthResponse>("/auth/register", payload);
}

export type LoginPayload = {
  username: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiPost<AuthResponse>("/auth/login", payload);
}
