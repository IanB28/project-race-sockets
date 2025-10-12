export default class WinnerScene extends Phaser.Scene {
  constructor() {
    super("WinnerScene");
  }

  init(data) {
    this.winnerId = data.winnerId;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Fondo oscuro
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(0);

    // Título de la escena
    const title = this.add.text(width / 2, 150, "🏆 Carrera terminada 🏆", {
      fontSize: "64px",
      fontFamily: "Orbitron, Arial Black",
      color: "#FFD700",
      align: "center",
      shadow: { offsetX: 0, offsetY: 4, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5);

    // Animación de entrada para el título
    this.tweens.add({
      targets: title,
      y: 120,
      duration: 800,
      ease: "Bounce.easeOut",
    });

    // Trofeo animado
    const trophy = this.add.image(width / 2, 250, "trophy").setScale(0.5);
    this.tweens.add({
      targets: trophy,
      y: 220,
      duration: 800,
      ease: "Bounce.easeOut",
      yoyo: true,
      repeat: -1,
    });

    // Texto del ganador
    const winnerText = this.add.text(width / 2, 400, `Ganador: ${this.winnerId}`, {
      fontSize: "48px",
      fontFamily: "Orbitron, Arial Black",
      color: "#ffffff",
      align: "center",
      shadow: { offsetX: 0, offsetY: 4, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5);

    // Botón para volver al menú
    const restart = this.add.text(width / 2, 550, "🔄 Volver al menú", {
      fontSize: "32px",
      fontFamily: "Arial Black",
      color: "#00ff00",
      backgroundColor: "#333333",
      padding: { x: 20, y: 10 },
      align: "center",
      shadow: { offsetX: 0, offsetY: 4, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5).setInteractive();

    // Animación de entrada para el botón
    this.tweens.add({
      targets: restart,
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: "Power2",
    });

    // Evento para volver al menú
    restart.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    // Partículas para el ganador
    const particles = this.add.particles("spark");
    const emitter = particles.createEmitter({
      x: width / 2,
      y: 250,
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      blendMode: "ADD",
      lifespan: 800,
      frequency: 100,
    });

    // Detener partículas después de 5 segundos
    this.time.delayedCall(5000, () => emitter.stop());
  }
}
