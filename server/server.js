const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Carpeta para el frontend

io.on("connection", (socket) => {
  console.log("Nuevo jugador conectado:", socket.id);

  // Escuchar movimiento del jugador
  socket.on("mover", (data) => {
    // Reenviar a todos los demás
    io.emit("actualizar", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("Jugador desconectado:", socket.id);
    io.emit("desconectado", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
