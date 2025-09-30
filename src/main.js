import Phaser from "phaser";
import RaceScene from "./scenes/RaceScene.js";
import UIScene from "./scenes/UIScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade" },
  scene: [ PreloadScene, MenuScene, RaceScene, UIScene],
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);
