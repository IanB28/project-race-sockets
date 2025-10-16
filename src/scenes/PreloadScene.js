import Phaser from "phaser";

/**
 * Escena de precarga que se encarga de cargar todos los recursos necesarios
 * antes de iniciar el juego.
 * @extends Phaser.Scene
 */
export default class PreloadScene extends Phaser.Scene {
  /**
   * Constructor de la escena PreloadScene.
   */
  constructor() {
    super("PreloadScene");
  }

  /**
   * Método de Phaser que se ejecuta antes de que la escena sea creada.
   * Se utiliza para cargar todos los recursos necesarios para el juego.
   */
  preload() {
    /**
     * Carga de la imagen de fondo.
     * @type {Phaser.Loader.LoaderPlugin}
     */
    this.load.image("background", "img/background.png");

    /**
     * Carga de la imagen de la pista.
     * @type {Phaser.Loader.LoaderPlugin}
     */
    this.load.image("track", "img/track.png");

    /**
     * Carga de las imágenes de los coches.
     * Cada coche tiene un identificador único.
     * @type {Phaser.Loader.LoaderPlugin}
     */
    this.load.image("car1", "img/car1.png");
    this.load.image("car2", "img/car2.png");
    this.load.image("car3", "img/car3.png");
    this.load.image("car4", "img/car4.png");
    this.load.image("car5", "img/car5.png");
    this.load.image("car6", "img/car6.png");
    this.load.image("car7", "img/car7.png");
    this.load.image("car8", "img/car8.png");
    this.load.image("car9", "img/car9.png");

    /**
     * Carga de la imagen del trofeo para el ganador.
     * @type {Phaser.Loader.LoaderPlugin}
     */
    this.load.image("trophy", "img/trophy.png");

    /**
     * Carga de la imagen de la carita triste para los perdedores.
     * @type {Phaser.Loader.LoaderPlugin}
     */
    this.load.image("sadFace", "img/sadFace.png");

    /**
     * Carga de la imagen de partículas (spark) para efectos visuales.
     * @type {Phaser.Loader.LoaderPlugin}
     */
    this.load.image("spark", "img/spark.png");
  }

  /**
   * Método de Phaser que se ejecuta después de que los recursos han sido cargados.
   * Se utiliza para iniciar la siguiente escena del juego.
   */
  create() {
    /**
     * Cambia a la escena del menú principal (MenuScene).
     * @type {Phaser.Scenes.SceneManager}
     */
    this.scene.start("MenuScene");
  }
}
