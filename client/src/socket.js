import { io } from "socket.io-client";

const baseUrl =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
    : null) ||
  "https://bugpilot.onrender.com";

const socket = io(baseUrl, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
});

socket.on("connect", () => {
  console.info("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.warn("Socket connection error:", error?.message || error);
});

export default socket;
