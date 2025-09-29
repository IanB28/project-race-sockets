import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Fondo
    this.load.image("background", "src/assets/background.png");

    // Pista
    this.load.image("track", "src/assets/track.png");

    // Carros
    this.load.image("car1", "src/assets/car.png");
    this.load.image("car2", "src/assets/car2.png");
    this.load.image("car3", "src/assets/car3.png");
      this.load.image("car4", "src/assets/car4.png");
  }

  create() {
    this.scene.start("RaceScene");
  }
}
