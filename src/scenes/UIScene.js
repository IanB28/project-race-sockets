import Phaser from "phaser";
import socket from "../socket/connection.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.scoreText = this.add.text(20, 20, "Score: 0", { fontSize: "24px", fill: "#fff" });

    socket.on("scoreUpdate", (score) => {
      this.scoreText.setText(`Score: ${score}`);
    });
  }
}

//console.log(socket);

///MOSTRAR PUNTAJES Y COMBOS DE TECLASSSSSSSS 