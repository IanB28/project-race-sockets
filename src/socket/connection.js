import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Cambiar a VPS/dominio en producción
export default socket;
