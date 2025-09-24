// socket.js
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

// Conectar al backend
const socket = io("http://localhost:3000"); // o la IP del servidor

socket.on("connect", () => {
  console.log("Conectado al backend, ID:", socket.id);
  socket.emit("ping", "Hola desde el frontend!");
});

socket.on("pong", (msg) => {
  console.log(msg);
});

export default socket; // exportamos para usarlo en otros módulos
