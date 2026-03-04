import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { api } from "@/api/client";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                await api.post("/auth/refresh/", {}, { withCredentials: true });
                setAccessToken("authenticated");
            } catch {
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    const login = () => {
        setAccessToken("authenticated");
    };

    const logout = () => {
        setAccessToken(null);
    };

    const setToken = (token: string | null) => {
        setAccessToken(token);
    }

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                isAuthenticated: !!accessToken,
                loading,
                login,
                logout,
                setAccessToken: setToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
