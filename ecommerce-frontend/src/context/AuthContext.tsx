import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loginUser: (token: string) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);

        // Optional: check expiration
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // 🔥 Remove "ROLE_" prefix from role (backend sends "ROLE_ADMIN", we need "ADMIN")
          const cleanRole = decoded.role.replace("ROLE_", "");
          setUser({
            username: decoded.sub,
            role: cleanRole,
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const loginUser = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);

    const decoded = jwtDecode<JwtPayload>(token);
    // 🔥 Remove "ROLE_" prefix from role (backend sends "ROLE_ADMIN", we need "ADMIN")
    const cleanRole = decoded.role.replace("ROLE_", "");

    setUser({
      username: decoded.sub,
      role: cleanRole,
    });
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};