import Phaser from "phaser";
import socket from "./js/socket.js";

// Configuraci贸n de la pista y carril
const CAR_SCALE = 0.25; // factor de escala

const TRACK_HEIGHT = 150; // Altura de la pista

class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {};
  }

  preload() {
    // Pistas
    this.load.image("track", "/img/track.png");
   // this.load.image("track2", "/img/track2.png");

    //Imagen de fondo
    this.load.image("background", "/img/background.png");

    // Carros
    this.load.image("car1", "/img/car.png");
    this.load.image("car2", "/img/car2.png");
    this.load.image("car3", "/img/car3.png");
    this.load.image("car4", "/img/car4.png");
    this.load.image("car5", "/img/car5.png");
  }

  create() {
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    bg.setDepth(-1);

    this.players = {};
    this.allCars = [];
    this.allTracks = [];
    this.cursors = this.input.keyboard.createCursorKeys();

    // 馃搶 Cuando llega info de un nuevo jugador
    socket.on("newPlayer", (playerInfo) => {
      if (!this.players[playerInfo.id]) {
        const car = this.createTrackAndCar(playerInfo.trackY, playerInfo.carKey);
        car.x = playerInfo.x;
        car.y = playerInfo.y;
        this.players[playerInfo.id] = car;
      }
    });


    // 馃搶 Actualizar posiciones
    socket.on("updatePlayer", (data) => {
      const car = this.players[data.id];
      if (car) {
        car.x = data.x;
        car.y = data.y;
      }
    });

    // 馃搶 Eliminar jugador
    socket.on("removePlayer", (playerId) => {
      if (this.players[playerId]) {
        this.players[playerId].destroy();
        delete this.players[playerId];
      }
    });

    // Avisar al servidor que este cliente se une
    socket.emit("joinGame");
  }


  /**
   * Funci贸n para crear pista y carro
   * @param {number} trackY - Posici贸n vertical de la pista
   */
  /**
   * trackY: posici贸n vertical
   * carKey: clave de la imagen del carro (ej: "car1")
   */
  createTrackAndCar(trackY, carKey) {
    const trackImage = this.textures.get("track").getSourceImage();
    const tileWidth = trackImage.width;

    const repetitions = Math.ceil(this.sys.game.config.width / tileWidth);
    const newTrackTiles = [];
    for (let i = 0; i < repetitions; i++) {
      const tile = this.add.image(
        i * tileWidth + tileWidth / 2,
        trackY,
        "track",
      );
      tile.setScale(1, TRACK_HEIGHT / trackImage.height);
      newTrackTiles.push(tile);
    }
    this.allTracks.push(newTrackTiles);

    const newCar = this.physics.add.sprite(tileWidth / 2, trackY, carKey);
    newCar.displayWidth = 170;
    newCar.displayHeight = 140;
    newCar.setCollideWorldBounds(true);
    this.allCars.push(newCar);

    return newCar; // 馃憟 para guardar en this.players
  }


  update() {
    const myCar = this.players[socket.id];
    if (!myCar) return;

    if (this.cursors.left.isDown) {
      myCar.x -= 5;
    } else if (this.cursors.right.isDown) {
      myCar.x += 5;
    }

    socket.emit("playerMove", { x: myCar.x, y: myCar.y });
  }

}

// Configuraci贸n del juego
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  physics: { default: "arcade" },
  scene: [RaceScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Inicializar el juego
new Phaser.Game(config);