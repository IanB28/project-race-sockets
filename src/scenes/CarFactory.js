
const CAR_WIDTH = 175;
const CAR_HEIGHT = 70;

export function createCar(scene, x, y, color, design = 0) {
  const graphics = scene.add.graphics();
  graphics.setDepth(2);

  // --- Sombra bajo el coche ---
  graphics.fillStyle(0x000000, 0.50);
  graphics.fillEllipse(CAR_WIDTH / 2, CAR_HEIGHT + 8, CAR_WIDTH * 0.75, 12);

  // --- RUEDAS (se dibujan primero) ---
  const wheelRadius = 18;
  const wheelY = CAR_HEIGHT - 10;
  // Rueda Trasera
  graphics.fillStyle(0x222222, 1);
  graphics.fillCircle(30, wheelY, wheelRadius);
  graphics.fillStyle(0x555555, 1);
  graphics.fillCircle(30, wheelY, wheelRadius * 0.7);
  // Rueda Delantera
  graphics.fillStyle(0x222222, 1);
  graphics.fillCircle(CAR_WIDTH - 30, wheelY, wheelRadius);
  graphics.fillStyle(0x555555, 1);
  graphics.fillCircle(CAR_WIDTH - 30, wheelY, wheelRadius * 0.7);

  // --- CARROCERÍA (Polígono ajustado) ---
  graphics.fillStyle(color, 1);
  graphics.lineStyle(2, 0x000000, 0); // Contorno negro integrado

  graphics.beginPath();
  // Parte inferior
  graphics.moveTo(10, CAR_HEIGHT - 11); // Inicio en la parte trasera inferior
  graphics.lineTo(CAR_WIDTH - 10, CAR_HEIGHT - 10); // Línea recta hacia el frente
  graphics.lineTo(CAR_WIDTH - 25, 35); // Subir hacia el capó
  graphics.lineTo(CAR_WIDTH * 0.5, 20); // Punto alto del techo delantero
  graphics.lineTo(CAR_WIDTH * 0.4, 13); // Punto alto del techo trasero
  graphics.lineTo(30, 15); // Bajar hacia el maletero
  graphics.closePath(); // Cerrar el polígono
  graphics.fillPath();
  graphics.strokePath();

  // --- VENTANA LATERAL ---
  graphics.fillStyle(0x111111, 0);
  graphics.beginPath();
  graphics.moveTo(20, 20); // esquina trasera-inferior
  graphics.lineTo(30, 12); // esquina trasera-superior
  graphics.lineTo(CAR_WIDTH - 30, 22); // esquina delantera-superior
  graphics.lineTo(CAR_WIDTH - 30, 25); // esquina delantera-inferior
  graphics.closePath();
  graphics.fillPath();

  // --- LUZ DELANTERA ---
  graphics.fillStyle(0xffffcc, 1);
  graphics.fillEllipse(CAR_WIDTH - 20, 52, 20, 7);

  // --- LUZ TRASERA ---
  graphics.fillStyle(0xff3333, 1);
  graphics.fillEllipse(15, 50, 10, 8);

  // --- TEXTURA FINAL ---
  const carTextureKey = `car_${Phaser.Math.RND.uuid()}`;
  graphics.generateTexture(carTextureKey, CAR_WIDTH, CAR_HEIGHT + 10);
  graphics.destroy();

  // --- SPRITE FÍSICO ---
  const car = scene.physics.add.sprite(x, y, carTextureKey);
  car.setDisplaySize(CAR_WIDTH, CAR_HEIGHT);
  car.setDepth(2);
  car.setCollideWorldBounds(true);

  return car;
}
