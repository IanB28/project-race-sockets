import Phaser from "phaser";
import RaceScene from "./scenes/RaceScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import WinnerScene from "./scenes/WinnerScene.js";

/**
 * Archivo principal del juego.
 * Configura y crea una instancia del juego utilizando Phaser.
 * 
 * @module main
 */

/**
 * Configuración del juego Phaser.
 * Define las propiedades principales del juego, como el tamaño, las escenas y la física.
 * @type {Object}
 * @property {string} type - Tipo de renderizado (Phaser.AUTO selecciona automáticamente WebGL o Canvas).
 * @property {number} width - Ancho de la ventana del juego (ajustado al ancho de la ventana del navegador).
 * @property {number} height - Alto de la ventana del juego (ajustado al alto de la ventana del navegador).
 * @property {Object} physics - Configuración del sistema de física (en este caso, "arcade").
 * @property {Phaser.Scene[]} scene - Lista de escenas que se utilizarán en el juego.
 * @property {Object} scale - Configuración del escalado del juego.
 * @property {string} scale.mode - Modo de escalado (RESIZE ajusta el tamaño automáticamente).
 * @property {string} scale.autoCenter - Centrado automático del juego (CENTER_BOTH centra horizontal y verticalmente).
 */
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade" },
  scene: [PreloadScene, MenuScene, RaceScene, WinnerScene],
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
};

/**
 * Crea una nueva instancia del juego Phaser con la configuración especificada.
 * @type {Phaser.Game}
 */
new Phaser.Game(config);
