// iniciar-wsp.js
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';

let client;
let isClientReady = false; // <-- AGREGADO: Variable para indicar si el cliente está listo

export async function IniciarWsp() {
    console.log('1. Iniciando IniciarWsp()...');
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
        }
    });

    console.log('2. Cliente de WhatsApp inicializado con configuración de Puppeteer.');

    client.on('qr', qr => {
        console.log('3. Evento "qr" recibido.');
        if (qr && typeof qr === 'string' && qr.length > 0) {
            console.log('4. Contenido del QR recibido (longitud):', qr.length);
            console.log('5. Intentando generar QR con qrcode-terminal...');
            try {
                qrcode.generate(qr, { small: true });
                console.log('6. qrcode-terminal ejecutado. Si no ves el QR, el problema es la terminal.');
            } catch (qrGenError) {
                console.error('ERROR al generar QR con qrcode-terminal:', qrGenError);
            }
        } else {
            console.warn('4. Advertencia: El contenido del QR recibido no es válido o está vacío.');
        }
    });

    client.on('ready', () => {
        console.log('7. Conexión exitosa. El bot está en línea.');
        isClientReady = true; // <-- AGREGADO: Marcar el cliente como listo
    });

    client.on('auth_failure', msg => {
        console.error('8. Fallo en la autenticación:', msg);
        isClientReady = false; // <-- AGREGADO: Marcar como no listo en caso de fallo
    });

    client.on('disconnected', reason => {
        console.warn('9. Cliente desconectado:', reason);
        isClientReady = false; // <-- AGREGADO: Marcar como no listo si se desconecta
        // Puedes implementar aquí un mecanismo de reconexión si lo deseas
        // IniciarWsp();
    });

    console.log('10. Llamando a client.initialize()...');
    client.initialize()
        .then(() => {
            console.log('11. client.initialize() completado exitosamente.');
        })
        .catch(err => {
            console.error('12. ERROR GRAVE al inicializar el cliente de WhatsApp:', err);
            console.error('13. Trace del error:', err.stack);
            console.error('Posibles causas: faltan dependencias de Chromium, problemas de permisos, falta de recursos.');
            isClientReady = false; // <-- AGREGADO: Marcar como no listo en caso de error
        });
}

// Exporta la instancia del cliente y su estado
export const getClient = () => {
    if (!client) {
        console.warn('14. Advertencia: Se intentó obtener el cliente de WhatsApp antes de inicializarlo.');
        throw new Error("Error, cliente no verificado");
    }
    return client;
};

// <-- AGREGADO: Nueva función para obtener el estado de listo
export const isClientAuthenticated = () => {
    return isClientReady;
};
