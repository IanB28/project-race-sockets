# Project Race Front

**Project Race Front** es un juego multijugador en línea desarrollado con **Phaser.js**. Los jugadores compiten en una carrera interactiva, seleccionan su coche y avanzan completando combos de teclas. El proyecto incluye sincronización en tiempo real con un servidor mediante **Socket.IO**.

---

## 🚀 Características

- **Multijugador en tiempo real:**  
  Los jugadores compiten en una carrera sincronizada con un servidor.
  
- **Selección de coche personalizada:**  
  Los jugadores pueden elegir entre varios coches disponibles.

- **Validación de combos:**  
  Los jugadores avanzan en la carrera completando combos de teclas.

- **Animaciones y efectos visuales:**  
  Incluye animaciones de semáforo, transiciones y efectos visuales.

- **Resultados dinámicos:**  
  Muestra al ganador y permite regresar al menú principal.

---

## 📂 Estructura del Proyecto

```plaintext
src/
├── main.js                # Archivo principal del juego
├── style.css              # Estilos personalizados
├── assets/                # Recursos estáticos (imágenes, sonidos, etc.)
├── scenes/                # Escenas del juego
│   ├── PreloadScene.js    # Escena de precarga de recursos
│   ├── MenuScene.js       # Escena del menú principal
│   ├── RaceScene.js       # Escena principal de la carrera
│   ├── WinnerScene.js     # Escena de resultados
├── socket/
│   ├── connection.js      # Configuración de la conexión con el servidor
public/
├── img/                   # Imágenes utilizadas en el juego
```

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/IanB28/project-race-sockets
cd project-race-front
```

### 2. Instalar dependencias
Asegúrate de tener **Node.js** instalado. Luego, ejecuta:
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
Inicia el servidor de desarrollo con:
```bash
npm run dev
```

### 4. Abrir en el navegador
Abre tu navegador y ve a:
```
http://localhost:5173
```

---

## 🎮 Cómo Jugar

1. **Inicio del juego:**
   - Al cargar el juego, se mostrarán las opciones del menú principal.

2. **Seleccionar un coche:**
   - Ingresa tu nombre en el campo de texto.
   - Haz clic en "Elegir coche" para seleccionar tu coche favorito.

3. **Comenzar la carrera:**
   - Haz clic en "Comenzar" para unirte a la carrera.
   - Completa los combos de teclas para avanzar en la pista.

4. **Ganar la carrera:**
   - El primer jugador en cruzar la línea de meta será declarado ganador.

5. **Resultados:**
   - Al finalizar la carrera, se mostrará el resultado (ganador o perdedor).
   - Haz clic en "Volver al menú" para reiniciar.

---

## 📦 Dependencias

El proyecto utiliza las siguientes tecnologías y librerías:

- **[Phaser.js](https://phaser.io/):** Framework para desarrollo de juegos en 2D.
- **[Socket.IO](https://socket.io/):** Comunicación en tiempo real entre cliente y servidor.
- **[Vite](https://vitejs.dev/):** Herramienta de desarrollo rápida para proyectos web.
- **Node.js:** Entorno de ejecución para JavaScript.

---


## 🌐 Conexión con el Servidor

El proyecto utiliza **Socket.IO** para la comunicación en tiempo real con el servidor. La configuración del servidor se encuentra en el archivo `src/socket/connection.js`. Asegúrate de que la URL del servidor sea correcta:



## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.

---




## 🧩 Próximas Mejoras

- Agregar efectos de sonido para la carrera y los resultados.
- Implementar un sistema de puntuación global.
- Mejorar la interfaz del modal de selección de coches.
- Optimizar el rendimiento para dispositivos móviles.

---

## 📞 Contacto

Si tienes alguna pregunta o sugerencia, no dudes en contactarme:

- **Correo:** tu-email@example.com
- **GitHub:** [https://github.com/IanB28/project-race-sockets](https://github.com/IanB28/project-race-sockets)