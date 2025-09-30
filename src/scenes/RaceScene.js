import Phaser from "phaser";
import socket from "../socket/connection.js";

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {};   // Carros
    this.tracks = {};    // Pistas
    this.combos = {};    // Combo actual de cada jugador
    //VALIDACION DE COMBOS
    this.comboCount = 0;
    this.comboGoal = 3;
    this.gameEnded = false;
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
    socket.on("youWon", () => {
      this.showWinnerOverlay("FELICIDADEEES, HAS GANADO LA CARRERA!", true);
      this.gameEnded = true;
    });

    socket.on("someOneWon", (data) => {
      this.showWinnerOverlay(`Has perdido. \n Mejor Suerte para la próxima vez`, false);
      this.gameEnded = true;
    });

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

checkKeyPress(key) {
    const combo = this.combos[socket.id];
    if (!combo) return;
    if(this.gameEnded) return;

    if (key === combo.sequence[combo.index]) {
      combo.index++;
      if (combo.index >= combo.sequence.length) {
        this.advanceCar();
        this.combos[socket.id] = this.generateCombo();
        this.updateComboText();

    console.log(this.comboCount);
        this.comboCount++;
        if (this.comboCount >= this.comboGoal) {
          console.log("Emitiendo señal de winner");
          socket.emit("winner");
        }
      }
    } else {
      // Error: retroceder carro
      const myCar = this.players[socket.id];
      if (myCar) myCar.x -= 30;
      combo.index = 0;
      if(!(this.comboCount <= 0)){
      this.comboCount--;
      }
      this.updateComboText();
    }
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
}
