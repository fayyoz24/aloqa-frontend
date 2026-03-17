import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { loginStudent } from "../api/students";

interface AuthState {
  studentId: number | null;
  isLoggedIn: boolean;
}

interface AuthContextValue extends AuthState {
  login: (pk: number, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const id = localStorage.getItem("student_id");
    const token = localStorage.getItem("access_token");
    return {
      studentId: id ? Number(id) : null,
      isLoggedIn: !!token && !!id,
    };
  });

  const login = useCallback(async (pk: number, password: string) => {
    const tokens = await loginStudent(pk, password);
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    localStorage.setItem("student_id", String(pk));
    setAuth({ studentId: pk, isLoggedIn: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("student_id");
    setAuth({ studentId: null, isLoggedIn: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
