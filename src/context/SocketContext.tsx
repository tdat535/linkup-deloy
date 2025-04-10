// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://linkup-server-bt8z.onrender.com";
const SOCKET_URL2 = "http://localhost:4000";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const currentUserId = localStorage.getItem("currentUserId");
  
    if (!token || !currentUserId) return;
  
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
    });
  
    // ✅ Set socket NGAY khi khởi tạo, để các component khác có thể dùng
    setSocket(newSocket);
  
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("userOnline", currentUserId);
      console.log("🟢 Emitted userOnline:", currentUserId);
    });
  
    newSocket.on("disconnect", () => console.log("❌ Socket disconnected"));
    newSocket.on("connect_error", (err) =>
      console.error("🚫 Socket error:", err.message)
    );
  
    return () => {
      newSocket.disconnect();
    };
  }, []);
  

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
