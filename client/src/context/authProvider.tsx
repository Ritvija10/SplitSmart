import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./authContext";
import type { AuthResponse, User } from "../types/auth";
import {
  getMeRequest,
  loginRequest,
  registerRequest,
} from "../services/authService";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // If a token is saved, verify it before deciding who the user is
  const [loading, setLoading] = useState<boolean>(
    () => !!localStorage.getItem("token")
  );

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (!saved) return;

    getMeRequest(saved)
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (res: AuthResponse) => {
    localStorage.setItem("token", res.token);
    setUser(res.user);
  };

  const login = async (email: string, password: string) => {
    handleAuth(await loginRequest(email, password));
  };

  const register = async (name: string, email: string, password: string) => {
    handleAuth(await registerRequest(name, email, password));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}