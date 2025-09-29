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
    socket.emit("joinGame");

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

    // Crear pista
    if (!this.tracks[playerInfo.id]) {
      const track = this.add.tileSprite(
        this.sys.game.config.width / 2,
        playerInfo.trackY,
        this.sys.game.config.width,
        190,
        "track"
      );
         this.tracks[playerInfo.id] = track;
    }

    // Crear carro
    //----PARA PONER EL CARRO RESPONSIVO Y TAMBIEN LA PISTA
    const car = this.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.carKey);
    car.displayWidth = 170;
    car.displayHeight = 140;

    
    /*car.displayWidth = this.sys.game.config.width * 0.05; // 5% del ancho
car.displayHeight = car.displayWidth * 0.8;          // mantener proporción


 //----PARA PONER EL CARRO RESPONSIVO Y TAMBIEN LA PISTA



*/

    car.setCollideWorldBounds(true);
    this.players[playerInfo.id] = car;

    // Generar combo inicial
    this.combos[playerInfo.id] = this.generateCombo();
    if (playerInfo.id === socket.id) this.updateComboText();
  }

  updatePlayer(data) {
    const car = this.players[data.id];
    if (car) {
      car.x = data.x;
      car.y = data.y;
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
    // No mover libremente el carro
  }
}
