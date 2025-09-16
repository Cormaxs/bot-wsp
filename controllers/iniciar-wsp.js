// controllers/iniciar-wsp.js
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';

let client;
let isClientReady = false;

// Esta función ahora recibe un callback que se ejecuta al estar listo
export async function IniciarWsp(onReadyCallback) {
    console.log('1. Iniciando cliente de WhatsApp...');
    const { Client, LocalAuth } = pkg;

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-extensions',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-zygote',
                '--single-process'
            ]
        },
        // Añade esta línea para desactivar plugins no esenciales
        disable: ["battery", "label"]
    });

    console.log('2. Cliente de WhatsApp inicializado.');

    client.on('qr', qr => {
        console.log('3. Escanea este código QR para autenticar tu sesión:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('4. Conexión exitosa. ¡El bot está en línea!');
        isClientReady = true;
        // Se ejecuta el callback solo cuando el bot está listo
        if (onReadyCallback) {
            onReadyCallback();
        }
    });

    client.on('auth_failure', msg => {
        console.error('5. Fallo en la autenticación:', msg);
        isClientReady = false;
    });

    client.on('disconnected', reason => {
        console.warn('6. Cliente desconectado:', reason);
        isClientReady = false;
        // Opcional: Implementar lógica de reconexión si se desea
    });

    client.initialize()
        .then(() => {
            console.log('7. client.initialize() completado. Esperando el evento "ready"...');
        })
        .catch(err => {
            console.error('8. ERROR GRAVE al inicializar el cliente de WhatsApp:', err);
            isClientReady = false;
        });
}

export const getClient = () => {
    if (!client) {
        throw new Error("Error: El cliente de WhatsApp no ha sido inicializado.");
    }
    return client;
};

export const isClientAuthenticated = () => {
    return isClientReady;
};