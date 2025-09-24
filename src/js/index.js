import Phaser from "phaser";
import socket from "./socket.js";

const TRACK_Y = 300;
const CAR_SCALE = 0.25;
const TRACK_HEIGHT = 200;

class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {}; // objeto para guardar todos los carros
  }

  preload() {
    this.load.image("car", "/src/img/car.png");
    this.load.image("track", "/src/img/track.png");
  }

  create() {
    const trackImage = this.textures.get("track").getSourceImage();
    const tileWidth = trackImage.width;
    const repetitions = Math.ceil(this.sys.game.config.width / tileWidth);

    // Crear pista para todos
    this.trackTiles = [];
    for (let i = 0; i < repetitions; i++) {
      const tile = this.add.image(i * tileWidth + tileWidth / 2, TRACK_Y, "track");
      tile.setScale(1, TRACK_HEIGHT / trackImage.height);
      this.trackTiles.push(tile);
    }

    // CARRO PROPIO
    this.car = this.physics.add.sprite(tileWidth / 2, TRACK_Y, "car");
    this.car.setScale(CAR_SCALE);
    this.car.setCollideWorldBounds(true);
    this.players[socket.id] = this.car;

    this.cursors = this.input.keyboard.createCursorKeys();

    // ESCUCHAR nuevos jugadores
    socket.on("newPlayer", (playerId) => {
      if (playerId !== socket.id && !this.players[playerId]) {
        const newCar = this.physics.add.sprite(tileWidth / 2, TRACK_Y + 100, "car"); // desplaza otro carro para diferenciar
        newCar.setScale(CAR_SCALE);
        this.players[playerId] = newCar;
      }
    });

    // ESCUCHAR jugadores desconectados
    socket.on("removePlayer", (playerId) => {
      if (this.players[playerId]) {
        this.players[playerId].destroy();
        delete this.players[playerId];
      }
    });
    // actualizar posición de otros jugadores
socket.on("updatePlayer", (data) => {
  const otherCar = this.players[data.id];
  if (otherCar) {
    otherCar.x = data.x;
    otherCar.y = data.y;
  }
});

    // Avisar al backend que este jugador está conectado
    socket.emit("joinGame");
  }

 update() {
  const tileWidth = this.trackTiles[0].width;
  const totalWidth = tileWidth * this.trackTiles.length;

  let moved = false;

  // Controles del jugador local
  if (this.cursors.left.isDown) {
    this.car.x = Math.max(this.car.x - 5, tileWidth / 2);
    moved = true;
  }
  if (this.cursors.right.isDown) {
    this.car.x = Math.min(this.car.x + 5, totalWidth - tileWidth / 2);
    moved = true;
  }

  this.car.y = TRACK_Y;

  // Si hubo movimiento, avisar al backend
  if (moved) {
    socket.emit("playerMove", { x: this.car.x, y: this.car.y });
  }
}

}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#222",
  physics: { default: "arcade" },
  scene: [RaceScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
