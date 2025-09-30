import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Fondo
    /*this.load.image("background", "src/assets/background.png");

    // Pista
    this.load.image("track", "src/assets/track.png");

    // Carros
    this.load.image("car1", "src/assets/car1.png");
    this.load.image("car2", "src/assets/car2.png");
    this.load.image("car3", "src/assets/car3.png");
      this.load.image("car4", "src/assets/car4.png");
        this.load.image("car5", "src/assets/car5.png");*/


        this.load.image("background", "img/background.png");

    // Pista
    this.load.image("track", "img/track.png");

    // Carros
    this.load.image("car1", "img/car1.png");
    this.load.image("car2", "img/car2.png");
    this.load.image("car3", "img/car3.png");
      this.load.image("car4", "img/car4.png");
        this.load.image("car5", "img/car5.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
