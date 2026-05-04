import { io } from "socket.io-client";

const localDevSocketUrl =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : null;

const baseUrl =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
    : null) ||
  localDevSocketUrl ||
  "https://bugpilot.onrender.com";

const socket = io(baseUrl, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
});

socket.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    console.info("Socket connected:", socket.id);
  }
});

socket.on("connect_error", (error) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Socket connection error:", error?.message || error);
  }
});

export default socket;
