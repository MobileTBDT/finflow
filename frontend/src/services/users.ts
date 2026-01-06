import { apiGet, apiPut } from "./api";

export type User = {
  id: number;
  username: string;
  email: string;
  fullname: string;
  phone?: string;
  dateofbirth?: string;
  image?: string;
  createdAt: string;
};

export type UpdateProfilePayload = {
  fullname?: string;
  phone?: string;
  dateofbirth?: string;
  image?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function getProfile(token: string) {
  return apiGet<User>("/users/me", token);
}

export async function updateProfile(
  payload: UpdateProfilePayload,
  token: string
) {
  return apiPut<User>("/users/me", payload, token);
}

export async function changePassword(
  payload: ChangePasswordPayload,
  token: string
) {
  return apiPut<{ message: string }>("/users/me/password", payload, token);
}
