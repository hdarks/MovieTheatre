import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (namespace = "/", options = {}) => {
    const socketRef = useRef(null);

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
        socketRef.current = io(baseUrl + namespace, {
            transports: ["websocket"],
            ...options,
        });

        socketRef.current.on("connect", () => {
            console.log("Connected: ", socketRef.current.id);
        });

        socketRef.current.on("connect_err", (err) => {
            console.error("Connection Error: ", err.message);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [namespace]);

    return socketRef.current;
};