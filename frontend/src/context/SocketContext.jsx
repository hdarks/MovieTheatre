import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
        socketRef.current = io(baseUrl + "/showtimes", {
            transports: ["websocket"],
        });
        socketRef.current.on("connect", () => {
            console.log("Global socket connected:", socketRef.current.id);
            if (!localStorage.getItem("sessionId")) {
                localStorage.setItem("sessionId", socketRef.current.id);
            }
        });
        socketRef.current.on("connect_error", (err) => {
            console.error("Connection Error:", err.message);
        });
        setSocket(socketRef.current);
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSharedSocket = () => useContext(SocketContext);