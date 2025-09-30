import Phaser from "phaser";
import socket from "../socket/connection.js";
import { createCar } from "./CarFactory.js";

const TRACK_HEIGHT = 50; // Altura de cada carril
const SKY_HEIGHT = 300; // Altura del cielo
const MAX_TRACKS = 12; // Número máximo de carriles

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {};
    this.tracks = {};
    this.combos = {};
  }

  create() {
    const roadWidth = this.sys.game.config.width;
    const roadHeight = this.sys.game.config.height;

    // --- Cielo nocturno ---
    this.add.rectangle(
      roadWidth / 2,
      SKY_HEIGHT / 2,
      roadWidth,
      SKY_HEIGHT,
      0x0a0a23 // Azul oscuro para el cielo
    );

    // --- Luna ---
    const moonX = roadWidth - 300; // Posición horizontal de la luna
    const moonY = 130; // Posición vertical de la luna
    this.add.circle(moonX, moonY, 80, 0xfafad2); // Luna amarilla clara

    // --- Estrellas ---
    for (let i = 0; i < 50; i++) {
      const starX = Phaser.Math.Between(20, roadWidth - 20);
      const starY = Phaser.Math.Between(20, SKY_HEIGHT - 20);
      const starSize = Phaser.Math.Between(1, 3);
      this.add.circle(starX, starY, starSize, 0xffffff);
    }

    // --- Edificios ---
    const buildingColors = [0x555555, 0x444444, 0x666666, 0x333333]; // Diferentes tonos de gris
    const windowColor = 0xffffcc; // Amarillo claro para las ventanas
    const graphics = this.add.graphics();

    for (let i = 0; i < roadWidth; i += 100) {
      const buildingX = i + 50; // Posición horizontal del edificio
      const buildingY = SKY_HEIGHT - 10; // Posición vertical base del edificio
      const buildingWidth = Phaser.Math.Between(80, 120); // Ancho aleatorio del edificio
      const buildingHeight = Phaser.Math.Between(100, 250); // Altura aleatoria del edificio
      const buildingColor = buildingColors[Phaser.Math.Between(0, buildingColors.length - 1)];

      // Dibujar edificio
      graphics.fillStyle(buildingColor, 1);
      graphics.fillRect(buildingX, buildingY - buildingHeight, buildingWidth, buildingHeight);

      // Dibujar ventanas
      const windowWidth = 15;
      const windowHeight = 20;
      const windowPadding = 10;

      for (let x = buildingX + windowPadding; x < buildingX + buildingWidth - windowPadding; x += windowWidth + windowPadding) {
        for (let y = buildingY - buildingHeight + windowPadding; y < buildingY - windowPadding; y += windowHeight + windowPadding) {
          graphics.fillStyle(windowColor, 1);
          graphics.fillRect(x, y, windowWidth, windowHeight);
        }
      }
    }

    // --- Semáforo ---
    const trafficLightX = 80; // Posición horizontal del semáforo
    const trafficLightY = SKY_HEIGHT - 50; // Posición vertical del semáforo

    // Poste del semáforo
    graphics.fillStyle(0x333333, 1); // Gris oscuro
    graphics.fillRect(trafficLightX, trafficLightY, 10, 100);

    // Caja del semáforo
    graphics.fillStyle(0x000000, 1); // Negro
    graphics.fillRect(trafficLightX - 10, trafficLightY - 50, 30, 50);

    // Luces del semáforo
    graphics.fillStyle(0xff0000, 1); // Rojo
    graphics.fillCircle(trafficLightX + 5, trafficLightY - 40, 8);

    graphics.fillStyle(0xffff00, 1); // Amarillo
    graphics.fillCircle(trafficLightX + 5, trafficLightY - 25, 8);

    graphics.fillStyle(0x00ff00, 1); // Verde
    graphics.fillCircle(trafficLightX + 5, trafficLightY - 10, 8);

    // --- Árboles ---
    const treeColor = 0x1b3a1b; // Verde oscuro para los árboles
    const trunkColor = 0x8b4513; // Marrón para el tronco
    const treeStartX = trafficLightX + 100; // Los árboles comienzan después del semáforo
    for (let i = treeStartX; i < roadWidth; i += 150) {
      const treeX = i; // Posición horizontal del árbol
      const treeY = SKY_HEIGHT - 40; // Posición vertical del árbol

      // Tronco del árbol
      graphics.fillStyle(trunkColor, 1);
      graphics.fillRect(treeX, treeY, 20, 40);

      // Copa del árbol
      graphics.fillStyle(treeColor, 1);
      graphics.fillCircle(treeX + 10, treeY - 20, 30);
    }

    // --- Fondo de la carretera ---
    const roadYStart = SKY_HEIGHT; // La carretera comienza justo debajo del cielo
    const roadHeightAdjusted = roadHeight - SKY_HEIGHT; // Altura ajustada para la carretera
    this.add.rectangle(
      roadWidth / 2,
      roadYStart + roadHeightAdjusted / 2,
      roadWidth,
      roadHeightAdjusted,
      0x333333 // Gris oscuro para la carretera
    );

    // --- Bordes de la pista ---
    const borderHeight = 20;
    const borderWidth = roadWidth;
    const borderColor1 = 0xff0000; // Rojo
    const borderColor2 = 0xffffff; // Blanco

    for (let i = 0; i < borderWidth; i += 40) {
      const color = i % 80 === 0 ? borderColor1 : borderColor2;
      this.add.rectangle(i, roadYStart + roadHeightAdjusted - borderHeight, 40, borderHeight, color);
      this.add.rectangle(i, roadYStart, 40, borderHeight, color);
    }

    // --- Texto combo del jugador local ---
    this.comboText = this.add.text(20, 20, "", { fontSize: "28px", color: "#ffffff" });

    // --- Eventos Socket ---
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

    // Verificar si hay espacio para más carriles
    const trackIndex = Object.keys(this.tracks).length;
    if (trackIndex >= MAX_TRACKS) {
      console.warn("No hay espacio para más carriles.");
      return;
    }

    // Calcular posición del carril
    const trackY = SKY_HEIGHT + (trackIndex + 1) * TRACK_HEIGHT - TRACK_HEIGHT / 2;

    // Crear pista (carril) como rectángulo gris
    const track = this.add.rectangle(
      this.sys.game.config.width / 2,
      trackY,
      this.sys.game.config.width,
      TRACK_HEIGHT,
      0x333333
    );

    // Línea blanca central punteada
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xffffff, 1); // Estilo de las líneas (blancas, grosor 4)

    const dashLength = 40; // Longitud de cada segmento de línea
    const gapLength = 20; // Espacio entre segmentos
    const startX = 0; // Inicio de las líneas en el carril (izquierda)
    const endX = this.sys.game.config.width; // Fin de las líneas en el carril (derecha)

    for (let x = startX; x < endX; x += dashLength + gapLength) {
      graphics.lineBetween(x, trackY, x + dashLength, trackY); // Dibujar segmento horizontal
    }

    this.tracks[playerInfo.id] = track;

    // Elegir diseño de coche (0, 1, 2)
    const design = playerInfo.design !== undefined
      ? playerInfo.design
      : Phaser.Math.Between(0, 2);

    // Color aleatorio o dado por el servidor
    const color = playerInfo.color || Phaser.Display.Color.RandomRGB().color;

    // Ajustar la posición vertical del coche al centro del carril
    const carY = trackY; // El coche se posiciona en el centro del carril

    // Crear coche con diseño usando CarFactory
    const car = createCar(this, playerInfo.x, carY, color, design);

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

    // Notificar backend
    socket.emit("playerMove", { x: myCar.x, y: myCar.y });
  }
}
