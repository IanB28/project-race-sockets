import Phaser from "phaser";
import socket from "../socket/connection.js";
import { createCar } from "./CarFactory.js";

const TRACK_HEIGHT = 100;
const SKY_HEIGHT = 350;
const MAX_TRACKS = 5;

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
    this.players = {};
    this.tracks = {};
    this.combos = {};
    this.comboCount = 0;
    this.comboGoal = 17;
    this.gameEnded = false;
    this.myId = null;
    this.initialPositionsSet = false;
    this.pendingPlayers = [];
    this.raceStarted = false;
    this.connectedPlayers = 0;
  }

  create() {
    const roadWidth = this.sys.game.config.width;
    const roadHeight = this.sys.game.config.height;

    this.add.rectangle(
      roadWidth / 2,
      SKY_HEIGHT / 2,
      roadWidth,
      SKY_HEIGHT,
      0x0a0a23,
    );

    const moonX = roadWidth - 300;
    const moonY = 130;
    this.add.circle(moonX, moonY, 80, 0xfafad2);

    for (let i = 0; i < 50; i++) {
      const starX = Phaser.Math.Between(20, roadWidth - 20);
      const starY = Phaser.Math.Between(20, SKY_HEIGHT - 20);
      const starSize = Phaser.Math.Between(1, 3);
      this.add.circle(starX, starY, starSize, 0xffffff);
    }

    const buildingColors = [0x555555, 0x444444, 0x666666, 0x333333];
    const windowColor = 0xffffcc;
    const graphics = this.add.graphics();

    const minWidth = 80;
    const maxWidth = 120;
    const gapBetweenBuildings = 2.5;
    let nextBuildingX = 20;

    while (nextBuildingX < roadWidth - minWidth) {
      const buildingWidth = Phaser.Math.Between(minWidth, maxWidth);
      const usableWidth = Math.min(
        buildingWidth,
        roadWidth - nextBuildingX - gapBetweenBuildings,
      );
      if (usableWidth < minWidth) break;

      const buildingHeight = Phaser.Math.Between(100, 250);
      const buildingColor =
        buildingColors[Phaser.Math.Between(0, buildingColors.length - 1)];
      const buildingBottomY = SKY_HEIGHT - 10;

      graphics.fillStyle(buildingColor, 1);
      graphics.fillRect(
        nextBuildingX,
        buildingBottomY - buildingHeight,
        usableWidth,
        buildingHeight,
      );

      const windowWidth = 15;
      const windowHeight = 20;
      const windowPadding = 10;

      const usableCols = Math.floor(
        (usableWidth - windowPadding) / (windowWidth + windowPadding),
      );
      const usableRows = Math.floor(
        (buildingHeight - windowPadding) / (windowHeight + windowPadding),
      );

      const horizontalOffset =
        (usableWidth -
          (usableCols * windowWidth + (usableCols - 1) * windowPadding)) /
        2;
      const verticalOffset =
        (buildingHeight -
          (usableRows * windowHeight + (usableRows - 1) * windowPadding)) /
        2;

      for (let col = 0; col < usableCols; col++) {
        for (let row = 0; row < usableRows; row++) {
          const x =
            nextBuildingX +
            horizontalOffset +
            col * (windowWidth + windowPadding);
          const y =
            buildingBottomY -
            buildingHeight +
            verticalOffset +
            row * (windowHeight + windowPadding);
          graphics.fillStyle(windowColor, 1);
          graphics.fillRect(x, y, windowWidth, windowHeight);
        }
      }

      nextBuildingX += usableWidth + gapBetweenBuildings;
    }

    const trafficLightX = 80;
    const trafficLightY = SKY_HEIGHT - 50;

    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(trafficLightX, trafficLightY, 10, 100);

    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(trafficLightX - 10, trafficLightY - 50, 30, 50);

    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(trafficLightX + 5, trafficLightY - 40, 8);

    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(trafficLightX + 5, trafficLightY - 25, 8);

    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(trafficLightX + 5, trafficLightY - 10, 8);

    const treeColor = 0x1b3a1b;
    const trunkPalette = [0x8b5a2b];
    const treeStartX = trafficLightX + 100;

    for (let i = treeStartX; i < roadWidth; i += 150) {
      const treeX = i;
      const treeY = SKY_HEIGHT - 40;

      const trunkHeight = Phaser.Math.Between(30, 55);
      const trunkWidth = Phaser.Math.Between(14, 22);
      const canopyRadius = Phaser.Math.Between(24, 38);
      const canopyOffsetY = Phaser.Math.Between(18, 32);
      const trunkColorVariant =
        trunkPalette[Phaser.Math.Between(0, trunkPalette.length - 1)];

      graphics.fillStyle(trunkColorVariant, 1);
      graphics.fillRect(
        treeX,
        treeY - (trunkHeight - 40),
        trunkWidth,
        trunkHeight,
      );

      graphics.fillStyle(treeColor, 1);
      graphics.fillCircle(
        treeX + trunkWidth / 2,
        treeY - trunkHeight + canopyOffsetY,
        canopyRadius,
      );
    }

    const roadYStart = SKY_HEIGHT;
    const roadHeightAdjusted = roadHeight - SKY_HEIGHT;
    this.add.rectangle(
      roadWidth / 2,
      roadYStart + roadHeightAdjusted / 2,
      roadWidth,
      roadHeightAdjusted,
      0x333333,
    );

    this.finishLineX = roadWidth - 200;
    this.finishLineWidth = 36;
    const finishLineHeight = roadHeightAdjusted - 56;

    const finishContainer = this.add.container(
      this.finishLineX,
      roadYStart + finishLineHeight / 2,
    );
    finishContainer.setDepth(5);

    const postHeight = finishLineHeight + 150;
    const leftPost = this.add.rectangle(
      -this.finishLineWidth,
      0,
      12,
      postHeight,
      0x202225,
    );
    const rightPost = this.add.rectangle(
      this.finishLineWidth,
      0,
      12,
      postHeight,
      0x202225,
    );
    finishContainer.add([leftPost, rightPost]);

    const bannerOffsetY = -finishLineHeight / 2 - 80;

    const banner = this.add.rectangle(
      0,
      bannerOffsetY,
      this.finishLineWidth * 4,
      40,
      0x1f2933,
    );
    banner.setStrokeStyle(3, 0xf1f1f1);

    const bannerText = this.add
      .text(0, bannerOffsetY, "META", {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#fafe00ff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);
    finishContainer.add([banner, bannerText]);

    const stripeHeight = this.finishLineWidth;
    const columnOffsets = [-this.finishLineWidth, 0, this.finishLineWidth];

    for (
      let y = -finishLineHeight / 2;
      y < finishLineHeight / 2;
      y += stripeHeight
    ) {
      const baseColor =
        Math.floor((y + finishLineHeight / 2) / stripeHeight) % 2 === 0
          ? 0xffffff
          : 0x0a0a0a;
      const middleColor = baseColor === 0xffffff ? 0x0a0a0a : 0xffffff;

      columnOffsets.forEach((offset, index) => {
        const color = index === 1 ? middleColor : baseColor;
        const stripe = this.add.rectangle(
          offset,
          y + stripeHeight / 2,
          this.finishLineWidth,
          stripeHeight + 1,
          color,
        );
        finishContainer.add(stripe);
      });
    }

    const borderHeight = 20;
    const borderWidth = roadWidth;
    const borderColor1 = 0xff0000;
    const borderColor2 = 0xffffff;

    for (let i = 0; i < borderWidth; i += 40) {
      const color = i % 80 === 0 ? borderColor1 : borderColor2;
      this.add.rectangle(
        i,
        roadYStart + roadHeightAdjusted - borderHeight,
        40,
        borderHeight,
        color,
      );
      this.add.rectangle(i, roadYStart, 40, borderHeight, color);
    }

    this.comboTextGroup = [];

    socket.on("newPlayer", (playerInfo) => {
      console.log("newPlayer recibido:", playerInfo.playerName);
      this.pendingPlayers.push(playerInfo);
      this.connectedPlayers++;

      if (this.connectedPlayers === MAX_TRACKS) {
        this.startTrafficLightAnimation();
      }
    });

    socket.on("updatePlayer", (data) => this.updatePlayer(data));

    socket.on("removePlayer", (playerId) => {
      this.removePlayer(playerId);
      this.connectedPlayers--;
    });

    socket.on("playerList", (orderedIds) => {
      console.log("PlayerList recibido:", orderedIds);
      if (!this.initialPositionsSet) {
        this.createAllPlayers(orderedIds);
      } else {
        this.reorganizeTracks(orderedIds);
      }
    });

    socket.on("youWon", () => {
      this.scene.start("WinnerScene", { winnerId: socket.id, isWinner: true });
    });

    socket.on("someOneWon", (data) => {
      this.scene.start("WinnerScene", {
        winnerId: data.winnerId,
        isWinner: false,
      });
    });

    const playerName = this.registry.get("playerName") || "Jugador";
    const playerCar = this.registry.get("playerCar") || "car1";

    socket.emit("joinGame", { playerName, playerCar });

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

  createPlayer(playerInfo, trackY) {
    const isMyPlayer = playerInfo.id === socket.id;
    if (isMyPlayer) {
      this.myId = playerInfo.id;
    }

    const trackContainer = this.createTrackGraphics(trackY);
    this.tracks[playerInfo.id] = trackContainer;

    const playerContainer = this.add.container(playerInfo.x, trackY);
    playerContainer.setDepth(10);

    const car = this.add
      .image(0, 0, playerInfo.carKey)
      .setScale(0.18)
      .setDepth(2);

    const nameText = this.add
      .text(0, -80, playerInfo.playerName || "Jugador", {
        fontSize: "22px",
        color: "#FFD700",
        fontFamily: "Orbitron, Arial Black",
        align: "center",
      })
      .setOrigin(0.5);

    const nameBg = this.add.graphics();
    nameBg.fillGradientStyle(0x333333, 0x555555, 0x333333, 0x555555, 0.8);
    nameBg.fillRoundedRect(
      -nameText.width / 2 - 15,
      -90,
      nameText.width + 30,
      40,
      10,
    );
    nameBg.lineStyle(3, 0xffffff, 1);
    nameBg.strokeRoundedRect(
      -nameText.width / 2 - 15,
      -90,
      nameText.width + 30,
      40,
      10,
    );

    this.tweens.add({
      targets: [nameBg, nameText],
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: "Power2",
    });

    playerContainer.add([car, nameBg, nameText]);

    this.players[playerInfo.id] = playerContainer;

    this.combos[playerInfo.id] = this.generateCombo();
    if (isMyPlayer) {
      this.updateComboText();
      console.log("Mi jugador creado:", playerInfo.playerName);
    }

    console.log("Jugador creado:", playerInfo.playerName, "en Y:", trackY);
  }

  createAllPlayers(orderedIds) {
    console.log("Creando todos los jugadores en orden");

    orderedIds.forEach((playerId, idx) => {
      const playerInfo = this.pendingPlayers.find((p) => p.id === playerId);

      if (!playerInfo) {
        console.log("No se encontro info para:", playerId);
        return;
      }

      if (this.players[playerId]) {
        console.log("Jugador ya existe:", playerId);
        return;
      }

      const trackY = SKY_HEIGHT + (idx + 1) * TRACK_HEIGHT - TRACK_HEIGHT / 2;
      this.createPlayer(playerInfo, trackY);
    });

    console.log("Todos los jugadores creados");
    this.initialPositionsSet = true;
  }

  reorganizeTracks(orderedIds) {
    console.log("Reorganizando carriles. Total jugadores:", orderedIds.length);

    orderedIds.forEach((playerId, idx) => {
      const trackY = SKY_HEIGHT + (idx + 1) * TRACK_HEIGHT - TRACK_HEIGHT / 2;

      const playerInfo = this.pendingPlayers.find((p) => p.id === playerId);

      if (!this.players[playerId] && playerInfo) {
        console.log(
          "Creando nuevo jugador durante reorganizacion:",
          playerInfo.playerName,
        );
        this.createPlayer(playerInfo, trackY);
      } else {
        if (this.tracks[playerId]) {
          this.tracks[playerId].y = trackY;
        }

        if (this.players[playerId]) {
          this.players[playerId].y = trackY;
        }
      }
    });

    console.log("Reorganizacion completada");
  }

  createTrackGraphics(trackY) {
    const roadWidth = this.sys.game.config.width;

    const trackContainer = this.add.container(0, trackY);

    const trackBg = this.add.rectangle(
      roadWidth / 2,
      0,
      roadWidth,
      TRACK_HEIGHT,
      0x333333,
    );

    const laneGraphics = this.add.graphics();
    laneGraphics.lineStyle(4, 0xffffff, 1);

    const dashLength = 40;
    const gapLength = 20;
    const startX = 0;
    const endX = roadWidth;

    for (let x = startX; x < endX; x += dashLength + gapLength) {
      laneGraphics.lineBetween(x, 0, x + dashLength, 0);
    }

    trackContainer.add([trackBg, laneGraphics]);

    return trackContainer;
  }

  updatePlayer(data) {
    const playerContainer = this.players[data.id];
    if (playerContainer) {
      playerContainer.x = data.x;
    }
  }

  removePlayer(playerId) {
    console.log("Eliminando jugador:", playerId);

    if (this.players[playerId]) {
      this.players[playerId].destroy();
      delete this.players[playerId];
    }

    if (this.tracks[playerId]) {
      this.tracks[playerId].destroy();
      delete this.tracks[playerId];
    }

    delete this.combos[playerId];

    this.pendingPlayers = this.pendingPlayers.filter((p) => p.id !== playerId);

    console.log("Jugador eliminado del frontend:", playerId);
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

    if (this.comboTextGroup) {
      this.comboTextGroup.forEach((text) => text.destroy());
    }

    this.comboTextGroup = [];

    let startX = 20;
    let startY = 20;

    combo.sequence.forEach((key, index) => {
      const color = index < combo.index ? "#00ff00" : "#ffffff";
      const text = this.add.text(startX, startY, key, {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: color,
      });

      startX += text.width + 10;

      this.comboTextGroup.push(text);
    });
  }

  advanceCar() {
    const myCar = this.players[socket.id];
    if (!myCar || this.gameEnded) return;

    const distance = 100;
    myCar.x += distance;

    socket.emit("playerMove", { x: myCar.x, y: myCar.y });

    const bounds = myCar.getBounds();
    if (bounds.right >= this.finishLineX) {
      this.gameEnded = true;
      socket.emit("winner");
    }
  }

  checkKeyPress(key) {
    if (!this.raceStarted || this.gameEnded) return;

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
      const myCar = this.players[socket.id];
      if (myCar) {
        myCar.x = Phaser.Math.Clamp(
          myCar.x - 30,
          0,
          this.sys.game.config.width,
        );
      }
      combo.index = 0;

      if (this.comboCount > 0) {
        this.comboCount--;
      }
    }

    this.updateComboText();
  }

  startTrafficLightAnimation() {
    const width = this.scale.width;
    const height = this.scale.height;

    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.8,
    );
    overlay.setDepth(100);

    const trafficLight = this.add
      .container(width / 2, height / 2)
      .setDepth(101);

    const redLight = this.add.circle(0, -100, 50, 0xff0000).setAlpha(0);
    const yellowLight = this.add.circle(0, 0, 50, 0xffff00).setAlpha(0);
    const greenLight = this.add.circle(0, 100, 50, 0x00ff00).setAlpha(0);

    trafficLight.add([redLight, yellowLight, greenLight]);

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
                this.tweens.add({
                  targets: [overlay, trafficLight],
                  alpha: 0,
                  duration: 500,
                  onComplete: () => {
                    overlay.destroy();
                    trafficLight.destroy();
                    console.log("La carrera ha comenzado");
                    this.raceStarted = true;
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  update() {}
}
