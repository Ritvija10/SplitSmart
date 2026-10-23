import { apiRequest } from "./api";
import type { AuthResponse, User } from "../types/auth";

export const registerRequest = (name: string, email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

export const loginRequest = (email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const getMeRequest = (token: string) =>
  apiRequest<{ user: User }>("/auth/me", { token });