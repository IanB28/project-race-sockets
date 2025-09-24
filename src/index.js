import Phaser from "phaser";

// Configuración de la pista y carril
const TRACK_Y = 300;       // Posición vertical fija de la pista
const CAR_SCALE = 0.25;    // Escala del carro
const TRACK_HEIGHT = 200;   // Altura de la pista (más estrecha)

class RaceScene extends Phaser.Scene {
  constructor() {
    super("RaceScene");
  }



  preload() {
    this.load.image("car", "/src/car.png");       // tu carro
    this.load.image("track", "/src/track.png");   // carril horizontal
  }

  create() {
    const trackImage = this.textures.get("track").getSourceImage();
    const tileWidth = trackImage.width;

    // Calcular cuántas copias necesitamos para llenar la pantalla
    const repetitions = Math.ceil(this.sys.game.config.width / tileWidth);

    // Crear las imágenes de la pista repetidas
    this.trackTiles = [];
    for (let i = 0; i < repetitions; i++) {
      const tile = this.add.image(
        i * tileWidth + tileWidth / 2,  // posición X
        TRACK_Y,                        // posición Y
        "track"
      );
      tile.setScale(1, TRACK_HEIGHT / trackImage.height); // escalar solo altura
      this.trackTiles.push(tile);
    }

    // Crear el carro centrado en el primer "tile"
    this.car = this.physics.add.sprite(
      tileWidth / 2,  // centro del primer tile
      TRACK_Y,        // vertical fijo
      "car"
    );
    this.car.setScale(CAR_SCALE);
    this.car.setCollideWorldBounds(true);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const tileWidth = this.trackTiles[0].width;
    const totalWidth = tileWidth * this.trackTiles.length;

    // Movimiento horizontal del carro limitado al ancho de la pista
    if (this.cursors.left.isDown) {
      this.car.x = Math.max(this.car.x - 5, tileWidth / 2);
    }
    if (this.cursors.right.isDown) {
      this.car.x = Math.min(this.car.x + 5, totalWidth - tileWidth / 2);
    }

    // Mantener el carro centrado verticalmente en la pista
    this.car.y = TRACK_Y;
  }
}

// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,   // ancho completo de la ventana
  height: window.innerHeight, // alto completo de la ventana
  backgroundColor: "#222",
  physics: { default: "arcade" },
  scene: [RaceScene],
  scale: {
    mode: Phaser.Scale.RESIZE,  // el canvas se ajusta al tamaño de la ventana
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Inicializar el juego
new Phaser.Game(config);
