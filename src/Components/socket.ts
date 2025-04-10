// src/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://linkup-server-bt8z.onrender.com";
let socket: Socket;

export const connectSocket = (): Socket => {
  const token = localStorage.getItem("accessToken");

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("🚫 Socket connection error:", err.message);
    });

    console.log("🔗 Connecting to socket:", SOCKET_URL);
  }

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error("Socket not connected. Call connectSocket() first.");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined as any;
  }
};
