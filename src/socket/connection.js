import { io } from "socket.io-client";

const socket = io("https://b0acaae4-572b-46a6-b2a5-5dba1a50b964-00-2b2ho32qb0w18.kirk.replit.dev/");
//const socket = io("http://localhost:3000");
socket.on("connect", () => console.log("Socket conectado:", socket.id));
socket.on("connect_error", (err) => console.error("Error de conexión:", err));
socket.on("disconnect", () => console.log("Socket desconectado")); // Cambiar a VPS/dominio en producción
export default socket;
