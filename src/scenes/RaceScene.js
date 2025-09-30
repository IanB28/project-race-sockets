import Phaser from "phaser";
import socket from "../socket/connection.js";

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {};   // Carros
    this.tracks = {};    // Pistas
    this.combos = {};    // Combo actual de cada jugador
  }

  

  create() {

    // Fondo general
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    bg.setDepth(-1);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Texto combo del jugador local
    this.comboText = this.add.text(20, 20, "", { fontSize: "28px", color: "#ffffff" });

    // Eventos Socket
    socket.on("newPlayer", (playerInfo) => this.addPlayer(playerInfo));
    socket.on("updatePlayer", (data) => this.updatePlayer(data));
    socket.on("removePlayer", (playerId) => this.removePlayer(playerId));

    // Unirse al juego
    const playerName = this.registry.get("playerName") || "Jugador";
const playerCar = this.registry.get("playerCar") || "car1";
socket.emit("joinGame", { playerName, playerCar });

    // Captura teclas
    this.input.keyboard.on("keydown", (event) => {
      const keyMap = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
      };
      const keyPressed = keyMap[event.key];
      if (keyPressed) this.checkKeyPress(keyPressed);
    });
  }

  addPlayer(playerInfo) {
    if (this.players[playerInfo.id]) return;
console.log("Creando pista para", playerInfo.id);
    // Crear pista
    if (!this.tracks[playerInfo.id]) {
      /*const track = this.add.tileSprite(
        this.sys.game.config.width / 2,
        playerInfo.trackY,
        this.sys.game.config.width,
        140,
        "track"
      );*/

      const track = this.add.tileSprite(
  this.sys.game.config.width / 2,
  playerInfo.trackY ?? 100, // fallback si trackY no existe
  this.sys.game.config.width,
  140, // altura suficiente para ver la pista
  "track"
).setDepth(-1);
         this.tracks[playerInfo.id] = track;
    }

    // Crear carro con el coche seleccionado
    const car = this.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.carKey);
    car.displayWidth = 170;
    car.displayHeight = 140;
    car.setCollideWorldBounds(true);
    this.players[playerInfo.id] = car;

    // Mostrar el nombre encima del coche
    const nameText = this.add.text(car.x, car.y - 80, playerInfo.playerName || "Jugador", {
      fontSize: "20px",
      color: "#FFD700",
      fontFamily: "Arial Black",
      align: "center",
      shadow: { offsetX: 0, offsetY: 2, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5);

    // Guarda el texto para actualizar su posición si el coche se mueve
    car.nameText = nameText;

    // Generar combo inicial
    this.combos[playerInfo.id] = this.generateCombo();
    if (playerInfo.id === socket.id) this.updateComboText();
  }

  updatePlayer(data) {
    const car = this.players[data.id];
    if (car) {
      car.x = data.x;
      car.y = data.y;
      if (car.nameText) {
        car.nameText.x = car.x;
        car.nameText.y = car.y - 80;
      }
    }
  }

  removePlayer(playerId) {
    if (this.players[playerId]) {
      this.players[playerId].destroy();
      delete this.players[playerId];
    }
    if (this.tracks[playerId]) {
      this.tracks[playerId].destroy();
      delete this.tracks[playerId];
    }
    delete this.combos[playerId];
  }

  generateCombo() {
    const keys = ["UP", "DOWN", "LEFT", "RIGHT"];
    const comboLength = 4;
    const combo = [];
    for (let i = 0; i < comboLength; i++) {
      combo.push(keys[Math.floor(Math.random() * keys.length)]);
    }
    return { sequence: combo, index: 0 };
  }

  checkKeyPress(key) {
    const combo = this.combos[socket.id];
    if (!combo) return;

    if (key === combo.sequence[combo.index]) {
      combo.index++;
      if (combo.index >= combo.sequence.length) {
        this.advanceCar();
        this.combos[socket.id] = this.generateCombo();
        this.updateComboText();
      }
    } else {
      // Error: retroceder carro
      const myCar = this.players[socket.id];
      if (myCar) myCar.x -= 30;
      combo.index = 0;
      this.updateComboText();
    }
  }

  updateComboText() {
    const combo = this.combos[socket.id];
    if (combo) {
      const display = combo.sequence.map((k, i) => (i < combo.index ? "✓" : k)).join(" ");
      this.comboText.setText(`Combo: ${display}`);
    }
  }

  advanceCar() {
    const myCar = this.players[socket.id];
    if (!myCar) return;

    const distance = 100;
    myCar.x += distance;

    // Desplazar pista para simular movimiento
    Object.values(this.tracks).forEach((track) => {
      track.tilePositionX += distance;
    });

    // Notificar backend
    socket.emit("playerMove", { x: myCar.x, y: myCar.y });
  }

  update() {
  // Actualiza la posición del nombre para todos los carros
  Object.values(this.players).forEach(car => {
    if (car.nameText) {
      car.nameText.x = car.x;
      car.nameText.y = car.y - 80;
    }
  });
}
}
