import { io } from "socket.io-client";

/**
 * Configuración y manejo de la conexión con el servidor mediante Socket.IO.
 * Este módulo establece la conexión con el servidor y maneja eventos básicos
 * como conexión, desconexión y errores.
 * 
 * @module connection
 */

/**
 * URL del servidor de Socket.IO.
 * Cambiar a la URL de producción o localhost según el entorno.
 * @type {string}
 */
const SERVER_URL = "https://b0acaae4-572b-46a6-b2a5-5dba1a50b964-00-2b2ho32qb0w18.kirk.replit.dev/";
// const SERVER_URL = "http://localhost:3000";

/**
 * Instancia de Socket.IO conectada al servidor.
 * @type {SocketIOClient.Socket}
 */
const socket = io(SERVER_URL);

/**
 * Evento que se ejecuta cuando el socket se conecta exitosamente al servidor.
 * Muestra el ID del socket en la consola.
 */
socket.on("connect", () => console.log("Socket conectado:", socket.id));

/**
 * Evento que se ejecuta cuando ocurre un error de conexión.
 * Muestra el error en la consola.
 * @param {Error} err - Detalles del error de conexión.
 */
socket.on("connect_error", (err) => console.error("Error de conexión:", err));

/**
 * Evento que se ejecuta cuando el socket se desconecta del servidor.
 * Muestra un mensaje en la consola indicando la desconexión.
 */
socket.on("disconnect", () => console.log("Socket desconectado"));

/**
 * Exporta la instancia de Socket.IO para ser utilizada en otras partes del proyecto.
 */
export default socket;
