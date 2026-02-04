// controllers/iniciar-wsp.js
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';

const { Client, LocalAuth } = pkg;

let client;
let isClientReady = false;

/**
 * Inicializa el cliente de WhatsApp.
 * @param {Function} onReadyCallback - Función que se ejecuta cuando el bot está listo.
 */
export async function IniciarWsp(onReadyCallback) {
    console.log('1. Iniciando cliente de WhatsApp...');

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            // Agregamos un User-Agent para que WhatsApp no detecte un "navegador automatizado" genérico
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-extensions'
            ],
            // Esto le da más tiempo a la página para estabilizarse antes de inyectar código
            waitNavigationFinished: true,
        },
        // Forzamos una versión específica que sabemos que NO destruye el contexto al cargar
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
    });

    console.log('2. Cliente de WhatsApp configurado.');

    // Evento para generar el código QR
    client.on('qr', qr => {
        console.log('3. Escanea este código QR para autenticar tu sesión:');
        qrcode.generate(qr, { small: true });
    });

    // Evento cuando el cliente está listo
    client.on('ready', () => {
        console.log('4. Conexión exitosa. ¡El bot está en línea!');
        isClientReady = true;
        if (onReadyCallback) {
            onReadyCallback();
        }
    });

    // Evento para capturar mensajes entrantes (Ayuda a depurar si el "Target closed" persiste)
    client.on('message', msg => {
        console.log(`[Mensaje Recibido] De: ${msg.from} - Contenido: ${msg.body}`);
    });

    // Manejo de errores de autenticación
    client.on('auth_failure', msg => {
        console.error('5. Fallo en la autenticación:', msg);
        isClientReady = false;
    });

    // Manejo de desconexión
    client.on('disconnected', reason => {
        console.warn('6. Cliente desconectado:', reason);
        isClientReady = false;
        // Intenta reinicializar si es necesario
        // client.initialize(); 
    });

    // Inicialización con manejo de errores global
    try {
        await client.initialize();
        console.log('7. client.initialize() ejecutado. Esperando validación...');
    } catch (err) {
        console.error('8. ERROR GRAVE al inicializar:', err);
        isClientReady = false;
    }
}

/**
 * Retorna la instancia del cliente.
 */
export const getClient = () => {
    if (!client) {
        throw new Error("Error: El cliente de WhatsApp no ha sido inicializado.");
    }
    return client;
};

/**
 * Retorna el estado de la conexión.
 */
export const isClientAuthenticated = () => {
    return isClientReady;
};