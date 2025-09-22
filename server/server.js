/* const express = require("express");
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
}); */



///Serveeeerrrrr


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const carriles = [0,1,2,3]; // 4 carriles
let players = {};

io.on("connection", socket => {
  console.log("Jugador conectado:", socket.id);

  // Asignar carril
  let lane = carriles.shift() ?? 0; // si se acaban, reutiliza 0

  players[socket.id] = {
    id: socket.id,
    x: 60,
    lane: lane,
    color: "#" + Math.floor(Math.random()*16777215).toString(16),
    name: "Jugador"
  };

  // Enviar tu ID al cliente
  socket.emit("miId", socket.id);

  // Enviar a todos los demás la actualización
  io.emit("actualizar", players[socket.id]);

  // Recibir movimiento de un jugador
  socket.on("mover", (data) => {
    if(players[socket.id]){
      players[socket.id].x = data.x;
      io.emit("actualizar", players[socket.id]);
    }
  });

  socket.on("disconnect", () => {
    // liberar carril
    carriles.push(players[socket.id].lane);
    delete players[socket.id];
    io.emit("desconectado", socket.id);
  });
});

server.listen(3000, () => console.log("Servidor en http://localhost:3000"));
