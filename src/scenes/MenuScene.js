/**
 * Escena del menú principal del juego.
 * Permite al jugador ingresar su nombre, seleccionar un coche y comenzar la carrera.
 * @extends Phaser.Scene
 */
export default class MenuScene extends Phaser.Scene {
  /**
   * Constructor de la escena MenuScene.
   */
  constructor() {
    super("MenuScene");

    /** @type {string[]} Lista de claves de los coches disponibles. */
    this.carKeys = ["car1", "car2", "car3", "car4", "car5", "car6", "car7", "car8", "car9"];

    /** @type {number} Índice del coche seleccionado. */
    this.selectedCar = 0;

    /** @type {Function} Método vinculado para mostrar el modal de selección de coche. */
    this.showCarSelectorModal = this.showCarSelectorModal.bind(this);
  }

  /**
   * Método de Phaser que se ejecuta al crear la escena.
   * Configura los elementos visuales y la lógica del menú.
   */
  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Fondo
    this.cameras.main.setBackgroundColor("#232526");

    // Título animado
    const racingTitle = this.add.text(width / 2, 80, "🏁 NEED MORE SPEED 🏁", {
      fontFamily: "Orbitron, Arial Black, Arial, sans-serif",
      fontSize: "64px",
      color: "#fff",
      stroke: "#FFD700",
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 10, color: "#000", blur: 24, fill: true },
      align: "center",
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
    }).setOrigin(0.5);

    // Animación del título
    this.tweens.add({
      targets: racingTitle,
      scale: { from: 1, to: 1.08 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onYoyo: () => {
        racingTitle.setColor("#FFD700");
        racingTitle.setStroke("#fff", 10);
      },
      onRepeat: () => {
        racingTitle.setColor("#fff");
        racingTitle.setStroke("#FFD700", 10);
      },
    });

    // Input HTML para el nombre del jugador
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.placeholder = "Ingresa tu nombre";
    this.nameInput.maxLength = 16;
    Object.assign(this.nameInput.style, {
      position: "fixed",
      left: "50%",
      top: "28%",
      transform: "translate(-50%, -50%)",
      fontSize: "24px",
      padding: "12px",
      borderRadius: "12px",
      border: "none",
      outline: "none",
      textAlign: "center",
      background: "#fff",
      color: "#232526",
      width: "220px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
      zIndex: 10,
    });
    document.body.appendChild(this.nameInput);

    // Sección "Tu coche"
    this.add.text(width / 2, height / 2 - 60, "Tu coche:", {
      fontSize: "28px",
      color: "#fff",
      fontFamily: "Arial Black",
      shadow: { offsetX: 0, offsetY: 2, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5);

    // Marco circular para la vista previa del coche
    const miniX = width / 2;
    const miniY = height / 2 + 10;
    this.carMiniShadow = this.add.graphics();
    this.carMiniShadow.fillStyle(0x000000, 0.22);
    this.carMiniShadow.fillCircle(miniX, miniY + 10, 54);

    this.carMiniFrame = this.add.graphics();
    this.carMiniFrame.lineStyle(7, 0xFFD700, 1);
    this.carMiniFrame.strokeCircle(miniX, miniY, 54);
    this.carMiniFrame.fillStyle(0x232526, 1);
    this.carMiniFrame.fillCircle(miniX, miniY, 54);

    // Imagen del coche seleccionado
    this.carMini = this.add.image(miniX, miniY, this.carKeys[this.selectedCar])
      .setScale(0.14)
      .setDepth(2)
      .setAlpha(1);

    // Nombre del coche seleccionado
    this.carLabel = this.add.text(miniX, miniY + 65, `Carro ${this.selectedCar + 1}`, {
      fontSize: "20px",
      color: "#FFD700",
      fontFamily: "Arial Black",
      align: "center",
      shadow: { offsetX: 0, offsetY: 2, color: "#000", blur: 8, fill: true },
    }).setOrigin(0.5);

    // Botón HTML para abrir el modal de selección de coche
    this.chooseBtn = document.createElement("button");
    this.chooseBtn.innerText = "Elegir coche";
    Object.assign(this.chooseBtn.style, {
      position: "fixed",
      left: "50%",
      top: "62%",
      transform: "translate(-50%, -50%)",
      fontSize: "18px",
      padding: "10px 28px",
      borderRadius: "10px",
      border: "none",
      background: "#00b894",
      color: "#fff",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      zIndex: 11,
      transition: "background 0.2s",
    });
    this.chooseBtn.onmouseover = () => this.chooseBtn.style.background = "#00cec9";
    this.chooseBtn.onmouseout = () => this.chooseBtn.style.background = "#00b894";
    document.body.appendChild(this.chooseBtn);

    this.chooseBtn.onclick = () => this.showCarSelectorModal();

    // Botón para comenzar la carrera
    const startBtn = this.add
      .text(width / 2, height / 2 + 200, "▶ Comenzar", {
        fontFamily: "Arial Black",
        fontSize: "32px",
        color: "#fff",
        backgroundColor: "#00b894",
        padding: { x: 32, y: 12 },
        align: "center",
        shadow: { offsetX: 0, offsetY: 4, color: "#000", blur: 12, fill: true },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.setAlpha(0.7);
    startBtn.setTint(0x888888);
    startBtn.disableInteractive();

    startBtn.on("pointerdown", () => {
      this.registry.set("playerName", this.nameInput.value);
      this.registry.set("playerCar", this.carKeys[this.selectedCar]);
      this.nameInput.remove();
      this.chooseBtn.remove();
      if (document.getElementById("car-modal")) document.getElementById("car-modal").remove();
      this.scene.start("RaceScene");
    });

    // Actualiza el estado del botón según el input y la selección
    this.updateCarMini = () => {
      this.carMini.setTexture(this.carKeys[this.selectedCar]);
      this.carLabel.setText(`Carro ${this.selectedCar + 1}`);
    };
    this.updateStartBtnState = () => {
      const hasName = this.nameInput.value.trim().length > 0;
      if (hasName) {
        startBtn.setAlpha(0.98);
        startBtn.clearTint();
        startBtn.setInteractive({ useHandCursor: true });
      } else {
        startBtn.setAlpha(0.7);
        startBtn.setTint(0x888888);
        startBtn.disableInteractive();
      }
    };
    this.nameInput.addEventListener("input", this.updateStartBtnState);

    // Limpieza de elementos HTML al salir de la escena
    this.events.on("shutdown", () => {
      this.nameInput.remove();
      this.chooseBtn.remove();
      if (document.getElementById("car-modal")) document.getElementById("car-modal").remove();
    });
    this.events.on("destroy", () => {
      this.nameInput.remove();
      this.chooseBtn.remove();
      if (document.getElementById("car-modal")) document.getElementById("car-modal").remove();
    });
  }

  /**
   * Muestra el modal de selección de coche.
   */
  showCarSelectorModal() {
    if (document.getElementById("car-modal")) document.getElementById("car-modal").remove();

    const modal = document.createElement("div");
    modal.id = "car-modal";
    modal.innerHTML = `
      <div class="car-modal-content">
        <h2>Elige tu coche</h2>
        <div class="car-modal-grid">
          ${this.carKeys.map((car, i) => `
            <div class="car-card${i === this.selectedCar ? " selected" : ""}" data-car="${i}">
              <div class="car-card-glow"></div>
              <div class="car-card-imgbox">
                <img src="img/${car}.png" alt="Carro ${i+1}" />
              </div>
              <div class="car-card-info">
                <span class="car-card-title">Carro ${i + 1}</span>
                <span class="car-card-status">${i === this.selectedCar ? "Seleccionado" : "Elegir"}</span>
              </div>
            </div>
          `).join("")}
        </div>
        <button id="close-car-modal">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.body.style.overflow = "hidden";

    // Selección de coche
    modal.querySelectorAll(".car-card").forEach(item => {
      item.onclick = () => {
        this.selectedCar = parseInt(item.getAttribute("data-car"));
        this.updateCarMini();
        modal.querySelectorAll(".car-card").forEach(c => {
          c.classList.remove("selected");
          c.querySelector(".car-card-status").innerText = "Elegir";
        });
        item.classList.add("selected");
        item.querySelector(".car-card-status").innerText = "Seleccionado";
        setTimeout(() => {
          modal.remove();
          document.body.style.overflow = "";
        }, 200);
      };
    });

    modal.querySelector("#close-car-modal").onclick = () => {
      modal.remove();
      document.body.style.overflow = "";
    };
    modal.onclick = e => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = "";
      }
    };
  }
}
