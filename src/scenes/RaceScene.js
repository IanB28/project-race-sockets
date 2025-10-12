import Phaser from "phaser";
import socket from "../socket/connection.js";
import { createCar } from "./CarFactory.js";

const TRACK_HEIGHT = 100; // Altura de cada carril
const SKY_HEIGHT = 350; // Altura del cielo
const MAX_TRACKS = 5; // Número máximo de carriles

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {};   // Carros
    this.tracks = {};    // Pistas
    this.combos = {};    // Combo actual de cada jugador
    this.comboCount = 0;
    this.comboGoal = 17;
    this.gameEnded = false;
    this.raceStarted = false; // Nueva bandera para controlar el inicio de la carrera
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

    // Contador de jugadores conectados
    this.connectedPlayers = 0;

    // --- Eventos Socket ---
    socket.on("newPlayer", (playerInfo) => {
      this.addPlayer(playerInfo);
      this.connectedPlayers++;

      // Si hay 5 jugadores conectados, inicia la animación del semáforo
      if (this.connectedPlayers === 5) {
        this.startTrafficLightAnimation();
      }
    });
    socket.on("updatePlayer", (data) => this.updatePlayer(data));
    socket.on("removePlayer", (playerId) => {
      this.removePlayer(playerId);
      this.connectedPlayers--;
    });
    socket.on("youWon", () => {
      this.showWinnerOverlay("FELICIDADEEES, HAS GANADO LA CARRERA!", true);
      this.gameEnded = true;
    });

    socket.on("someOneWon", (data) => {
      this.showWinnerOverlay(`Has perdido. \n Mejor Suerte para la próxima vez`, false);
      this.gameEnded = true;
    });

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

    // Ajustar la posición vertical del coche al centro del carril
    const carY = trackY; // El coche se posiciona en el centro del carril

    // Crear contenedor para el carro, el nombre y el fondo del nombre
    const playerContainer = this.add.container(playerInfo.x, carY);

    // Crear coche usando la imagen cargada en PreloadScene
    const car = this.add.image(0, 0, playerInfo.carKey)
      .setScale(0.18)
      .setDepth(2);

    // Texto del nombre encima del coche
    const nameText = this.add.text(0, -80, playerInfo.playerName || "Jugador", {
      fontSize: "22px",
      color: "#FFD700",
      fontFamily: "Orbitron, Arial Black",
      align: "center",
    }).setOrigin(0.5);

    // Fondo del nombre (rectángulo con bordes redondeados y degradado)
    const nameBg = this.add.graphics();
    nameBg.fillGradientStyle(0x333333, 0x555555, 0x333333, 0x555555, 0.8); // Fondo degradado
    nameBg.fillRoundedRect(-nameText.width / 2 - 15, -90, nameText.width + 30, 40, 10); // x, y, width, height, radius
    nameBg.lineStyle(3, 0xffffff, 1); // Borde blanco
    nameBg.strokeRoundedRect(-nameText.width / 2 - 15, -90, nameText.width + 30, 40, 10);

    // Agregar animación de entrada para el contenedor del nombre
    this.tweens.add({
      targets: [nameBg, nameText],
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: "Power2",
    });

    // Agregar carro, fondo y nombre al contenedor
    playerContainer.add([car, nameBg, nameText]);

    // Guardar el contenedor como el jugador
    this.players[playerInfo.id] = playerContainer;

    // Generar combo inicial
    this.combos[playerInfo.id] = this.generateCombo();
    if (playerInfo.id === socket.id) this.updateComboText();
  }

  updatePlayer(data) {
    const playerContainer = this.players[data.id];
    if (playerContainer) {
      // Actualiza solo la posición horizontal (x)
      playerContainer.x = data.x;

      // Mantén la posición vertical fija en el carril asignado
      const trackY = this.tracks[data.id]?.y || SKY_HEIGHT + (Object.keys(this.tracks).length + 1) * TRACK_HEIGHT - TRACK_HEIGHT / 2;
      playerContainer.y = trackY;
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


  updateComboText() {
    const combo = this.combos[socket.id];
    if (!combo) return;

    // Elimina los textos anteriores si existen
    if (this.comboTextGroup) {
      this.comboTextGroup.forEach((text) => text.destroy());
    }

    // Crea un grupo para los textos del combo
    this.comboTextGroup = [];

    // Posición inicial para los textos
    let startX = 20;
    let startY = 20;

    combo.sequence.forEach((key, index) => {
      const color = index < combo.index ? "#00ff00" : "#ffffff"; // Verde si ya se presionó, blanco si no
      const text = this.add.text(startX, startY, key, {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: color,
      });

      // Ajustar posición horizontal para el siguiente texto
      startX += text.width + 10;

      // Agregar el texto al grupo
      this.comboTextGroup.push(text);
    });
  }

  advanceCar() {
    const myCar = this.players[socket.id];
    if (!myCar) return;

    const distance = 100;
    myCar.x += distance;

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
checkKeyPress(key) {
  if (!this.raceStarted || this.gameEnded) return; // No permitir movimiento si la carrera no ha comenzado

  const combo = this.combos[socket.id];
  if (!combo) return;

  if (key === combo.sequence[combo.index]) {
    combo.index++;

    if (combo.index >= combo.sequence.length) {
      this.advanceCar();
      this.combos[socket.id] = this.generateCombo();
      this.comboCount++;
      if (this.comboCount >= this.comboGoal) {
        socket.emit("winner");
      }
    }
  } else {
    // Penalización por tecla incorrecta
    const myCar = this.players[socket.id];
    if (myCar) {
      // Limitar el retroceso para que no salga de la pantalla
      myCar.x = Phaser.Math.Clamp(myCar.x - 30, 0, this.sys.game.config.width);
    }
    combo.index = 0;

    if (this.comboCount > 0) {
      this.comboCount--;
    }
  }

  // Actualiza el combo visual
  this.updateComboText();
}


showWinnerOverlay(message, isWinner = false){
    console.log("🎨 ENTRANDO A showWinnerOverlay:", message, "isWinner:", isWinner);
    
    const bgColor = isWinner ? 0x27ae60 : 0xe74c3c; // Verde y rojo xd
    const borderColor = isWinner ? 0xffd700 : 0x95a5a6; //Dorado y gris

    console.log("🎨 Colores calculados - bg:", bgColor, "border:", borderColor);

    const overlay = this.add.rectangle(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      this.sys.game.config.width,
      this.sys.game.config.height,
      0x000000,
      0.7
    );
    overlay.setDepth(100);
    console.log("🎨 Overlay creado");

    const container = this.add.container(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2
    );
    container.setDepth(101);
    console.log("🎨 Container creado");

    // CAMBIO: Usar Graphics en lugar de Rectangle con setStroke
    const messageBg = this.add.graphics();
    messageBg.fillStyle(bgColor);
    messageBg.fillRect(-300, -100, 600, 200); // x, y, width, height (centrado)
    messageBg.lineStyle(5, borderColor); // grosor, color
    messageBg.strokeRect(-300, -100, 600, 200);
    console.log("🎨 MessageBg creado con Graphics");

    const winnerText = this.add.text(0, 0, message, {
      fontSize: "28px",
      color: "#ffffff",
      fontFamily: "Arial",
      align: "center"
    });
    winnerText.setOrigin(0.5);
    console.log("🎨 WinnerText creado");

    container.add([messageBg, winnerText]);
    console.log("🎨 Elementos agregados al container");

    //Animaciones de acuerdo al resultado
    container.setScale(0);
    console.log("🎨 Iniciando animación...");
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: isWinner ? 800 : 500,
      ease: isWinner ? "Bounce.easeOut" : "Power2.easeOut",
      onComplete: () => {
        console.log("🎨 Animación completada!");
      }
    });

    this.time.delayedCall(4000, () => {
      console.log("🎨 Iniciando desvanecimiento...");
      this.tweens.add({
        targets: [overlay, container],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          console.log("🎨 Elementos destruidos");
          overlay.destroy();
          container.destroy();
        }
      });
    });
}   update() {
    // No mover libremente el carro
  }

  // Método para la animación del semáforo
  startTrafficLightAnimation() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Fondo oscuro para el semáforo
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(100);

    // Semáforo grande
    const trafficLight = this.add.container(width / 2, height / 2).setDepth(101);

    // Luces del semáforo
    const redLight = this.add.circle(0, -100, 50, 0xff0000).setAlpha(0);
    const yellowLight = this.add.circle(0, 0, 50, 0xffff00).setAlpha(0);
    const greenLight = this.add.circle(0, 100, 50, 0x00ff00).setAlpha(0);

    trafficLight.add([redLight, yellowLight, greenLight]);

    // Animación de las luces
    this.tweens.add({
      targets: redLight,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        this.tweens.add({
          targets: yellowLight,
          alpha: 1,
          duration: 1000,
          onComplete: () => {
            this.tweens.add({
              targets: greenLight,
              alpha: 1,
              duration: 1000,
              onComplete: () => {
                // Desvanecer el semáforo y comenzar la carrera
                this.tweens.add({
                  targets: [overlay, trafficLight],
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    overlay.destroy();
                    trafficLight.destroy();
                    console.log("¡La carrera ha comenzado!");
                    this.raceStarted = true; // Activar la bandera para permitir movimiento
                  },
                });
              },
            });
          },
        });
      },
    });
  }
}
