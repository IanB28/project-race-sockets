// socket.js
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

// Conectar al backend
/*const socket = io("https://c68ab5e422a1.ngrok-free.app/" ,{
   transports: ["websocket"],
  secure: true
}); // o la IP del servidor
*/

const socket = io("localhost:3000"); 
socket.on("connect", () => {
  console.log("Conectado al backend, ID:", socket.id);
  socket.emit("ping", "Hola desde el frontend!");
});

socket.on("pong", (msg) => {
  console.log(msg);
});

export default socket; // exportamos para usarlo en otros módulos
