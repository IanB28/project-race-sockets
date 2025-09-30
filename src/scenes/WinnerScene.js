export default class WinnerScene extends Phaser.Scene {
  constructor() {
    super("WinnerScene");
  }

  init(data) {
    this.winnerId = data.winnerId;
  }

  create() {
    this.add.text(this.scale.width / 2, 200, "🏆 Carrera terminada 🏆", {
      fontSize: "48px",
      color: "#FFD700",
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, 300, `Ganador: ${this.winnerId}`, {
      fontSize: "32px",
      color: "#fff",
    }).setOrigin(0.5);

    const restart = this.add.text(this.scale.width / 2, 500, "🔄 Volver al menú", {
      fontSize: "28px",
      color: "#00ff00",
      backgroundColor: "#000",
      padding: { x: 15, y: 10 },
    }).setOrigin(0.5).setInteractive();

    restart.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
