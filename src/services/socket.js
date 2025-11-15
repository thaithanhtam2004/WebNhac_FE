import { io } from "socket.io-client";

export const socket = io("http://localhost:3000"); // đúng port backend

// Optional: tự đăng ký khi login
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});
