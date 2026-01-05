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

export type RegisterResponse = {
  access_token: string;
  refresh_token: string;
  info: any;
};

export function register(payload: RegisterPayload) {
  return apiPost<RegisterResponse>("/auth/register", payload);
}
