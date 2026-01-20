import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const { user } = useAuth();
    const role = user?.role || "guest";

    const isCustomer = role === "customer";
    const isStaff = role === "staff";
    const isManager = role === "manager";
    const isAdmin = role === "admin";

    return (
        <RoleContext.Provider value={{ role, isCustomer, isStaff, isManager, isAdmin }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);