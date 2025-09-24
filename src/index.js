import Phaser from "phaser";

// Configuración de la pista y carril
const CAR_SCALE = 0.25; // factor de escala


const TRACK_HEIGHT = 150;  // Altura de la pista

class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
  }

  preload() {
    // Pistas
    this.load.image("track", "/src/track.png");

    // Carros
    this.load.image("car1", "/src/car.png");
    this.load.image("car2", "/src/car2.png");
    this.load.image("car3", "/src/car3.png");
    this.load.image("car4", "/src/car4.png");
    this.load.image("car5", "/src/car5.png");
  }


  create() {
    // Inicializar arrays para todos los carros y pistas
    this.allCars = [];
    this.allTracks = [];

    // Crear la primera pista y carro
    this.createTrackAndCar(300,"car1");   // TRACK_Y = 100
    // Crear una segunda pista y carro
    this.createTrackAndCar(450,"car2");   // TRACK_Y = 350
    this.createTrackAndCar(600,"car3");
    this.createTrackAndCar(750,"car4");
    this.createTrackAndCar(900,"car5");

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  /**
   * Función para crear pista y carro
   * @param {number} trackY - Posición vertical de la pista
   */
  /**
   * trackY: posición vertical
   * carKey: clave de la imagen del carro (ej: "car1")
   */
  createTrackAndCar(trackY, carKey) {
    const trackImage = this.textures.get("track").getSourceImage();
    const tileWidth = trackImage.width;

    // Crear pista
    const repetitions = Math.ceil(this.sys.game.config.width / tileWidth);
    const newTrackTiles = [];
    for (let i = 0; i < repetitions; i++) {
      const tile = this.add.image(
        i * tileWidth + tileWidth / 2,
        trackY,
        "track"
      );
      tile.setScale(1, TRACK_HEIGHT / trackImage.height);
      newTrackTiles.push(tile);
    }
    this.allTracks.push(newTrackTiles);

    // Crear carro con la imagen indicada
    const newCar = this.physics.add.sprite(
      tileWidth / 2,
      trackY,
      carKey
    );
    //newCar.setScale(CAR_SCALE);
    newCar.displayWidth = 170;
    newCar.displayHeight = 140;
    newCar.setCollideWorldBounds(true);
    this.allCars.push(newCar);
  }


  update() {
    const tileWidth = this.textures.get("track").getSourceImage().width;

    // Mover todos los carros horizontalmente con controles



      const totalWidth = tileWidth * this.allTracks[0].length; // ancho de la pista correspondiente
      const playerCar = this.allCars[0];
      if (this.cursors.left.isDown) {
        playerCar.x = Math.max(playerCar.x - 5, tileWidth / 2);
      }
      if (this.cursors.right.isDown) {
        playerCar.x = Math.min(playerCar.x + 5, totalWidth - tileWidth / 2);
      }
      playerCar.y = playerCar.y; // mantener vertical
  }
}

// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  physics: { default: "arcade" },
  scene: [RaceScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Inicializar el juego
new Phaser.Game(config);
