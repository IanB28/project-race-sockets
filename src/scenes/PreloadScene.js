import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    
    this.load.image("background", "img/background.png");

    // Pista
    this.load.image("track", "img/track.png");

    // Carros
    this.load.image("car1", "img/car1.png");
    this.load.image("car2", "img/car2.png");
    this.load.image("car3", "img/car3.png");
    this.load.image("car4", "img/car4.png");
    this.load.image("car5", "img/car5.png");
    this.load.image("car6", "img/car6.png");
    this.load.image("car7", "img/car7.png");
    this.load.image("car8", "img/car8.png");
    this.load.image("car9", "img/car9.png");

    this.load.image("trophy", "img/trophy.png");
    
  this.load.image("sadFace", "img/sadFace.png");
  this.load.image("spark", "img/spark.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
