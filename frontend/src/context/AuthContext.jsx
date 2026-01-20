import React, { createContext, useEffect, useState, useContext, useRef } from "react";
import { getProfile, loginUser } from "@/api/userApi.js";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const logoutTimer = useRef(null);

    const isTokenExpired = (token) => {
        try {
            const deocded = jwtDecode(token);
            if (!deocded.exp) return false;
            return Date.now() >= deocded.exp * 1000;
        } catch {
            return true;
        }
    };

    const scheduleAutoLogout = (token) => {
        try {
            const decoded = jwtDecode(token);
            if (decoded.exp) {
                const expiryTime = decoded.exp * 1000;
                const delay = expiryTime - Date.now();

                if (logoutTimer.current) clearTimeout(logoutTimer.current);
                logoutTimer.current = setTimeout(() => {
                    logout();
                }, delay);
            }
        } catch { }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token) {
            if (isTokenExpired(token)) {
                logout();
                setLoading(false);
                return;
            }

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            scheduleAutoLogout(token);

            getProfile()
                .then((res) => {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                })
                .catch((err) => {
                    if (err.response?.status === 401) {
                        logout();
                    } else {
                        console.error("Fetching profile failed: ", err.message);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await loginUser(credentials);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        scheduleAutoLogout(res.data.token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }} >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };