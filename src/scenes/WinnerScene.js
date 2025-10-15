/**
 * Escena que muestra el resultado del juego, indicando si el jugador ganó o perdió.
 * @extends Phaser.Scene
 */
export default class WinnerScene extends Phaser.Scene {
  /**
   * Crea una nueva instancia de WinnerScene.
   */
  constructor() {
    super("WinnerScene");
  }

  /**
   * Inicializa la escena con datos de la partida.
   * @param {Object} data - Datos pasados a la escena.
   * @param {number} data.winnerId - ID del jugador ganador.
   * @param {boolean} data.isWinner - Indica si el jugador actual es el ganador.
   */
  init(data) {
    this.winnerId = data.winnerId;
    this.isWinner = data.isWinner;
  }

  /**
   * Crea los elementos visuales de la escena, incluyendo fondo, mensajes, iconos y botones.
   */
  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    /**
     * Fondo oscuro con bordes redondeados.
     * @type {Phaser.GameObjects.Graphics}
     */
    const overlay = this.add.graphics();
    overlay.fillStyle(0x232526, 1);
    overlay.fillRoundedRect(0, 0, width, height, 20);
    overlay.setDepth(0);

    /**
     * Contenedor principal de la escena.
     * @type {Phaser.GameObjects.Container}
     */
    const container = this.add.container(width / 2, height / 2).setDepth(1);

    /**
     * Fondo del mensaje con degradado y bordes redondeados.
     * @type {Phaser.GameObjects.Graphics}
     */
    const messageBg = this.add.graphics();
    messageBg.fillGradientStyle(
      this.isWinner ? 0x27ae60 : 0xe74c3c,
      this.isWinner ? 0x2ecc71 : 0xc0392b,
      this.isWinner ? 0x27ae60 : 0xe74c3c,
      this.isWinner ? 0x2ecc71 : 0xc0392b,
      1
    );
    messageBg.fillRoundedRect(-350, -200, 700, 400, 20);
    messageBg.lineStyle(5, this.isWinner ? 0xffd700 : 0x95a5a6, 1);
    messageBg.strokeRoundedRect(-350, -200, 700, 400, 20);

    container.add(messageBg);

    /**
     * Título del mensaje.
     * @type {Phaser.GameObjects.Text}
     */
    const title = this.add.text(0, -250, this.isWinner ? "🏆 ¡Ganaste! 🏆" : "😢 Mejor suerte la próxima vez 😢", {
      fontSize: "48px",
      fontFamily: "Orbitron, Arial Black",
      color: "#ffffff",
      align: "center",
      shadow: { offsetX: 0, offsetY: 4, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5);

    container.add(title);

    /**
     * Icono del resultado: trofeo o carita triste.
     * @type {Phaser.GameObjects.Image}
     */
    const icon = this.add.image(0, -50, this.isWinner ? "trophy" : "sadFace").setScale(0.8);
    container.add(icon);

    // Animación de rebote del icono
    this.tweens.add({
      targets: icon,
      y: -30,
      duration: 800,
      ease: "Bounce.easeOut",
      yoyo: true,
      repeat: -1,
    });

    /**
     * Fondo del botón para volver al menú.
     * @type {Phaser.GameObjects.Graphics}
     */
    const buttonBg = this.add.graphics();
    if(this.isWinner){
        buttonBg.fillStyle(0x3498db, 1);
    }else{
        buttonBg.fillStyle(0x27ae60, 1);
    }
    buttonBg.fillRoundedRect(-150, 100, 300, 60, 15);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-150, 100, 300, 60, 15);

    container.add(buttonBg);

    /**
     * Texto interactivo del botón.
     * @type {Phaser.GameObjects.Text}
     */
    const restart = this.add.text(0, 130, "🔄 Volver al menú", {
      fontSize: "28px",
      fontFamily: "Orbitron, Arial Black",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5).setInteractive();

    container.add(restart);

    // Evento para reiniciar y volver al menú
    restart.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    // Animación de entrada del contenedor
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: "Bounce.easeOut",
    });
  }
}
