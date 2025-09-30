import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // No cargamos imágenes
  }

  create() {
    this.scene.start("RaceScene");
  }
}
