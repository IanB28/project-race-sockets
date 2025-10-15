import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
socket.on("connect", () => console.log("Socket conectado:", socket.id));
socket.on("connect_error", (err) => console.error("Error de conexión:", err));
socket.on("disconnect", () => console.log("Socket desconectado")); // Cambiar a VPS/dominio en producción
export default socket;
