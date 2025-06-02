import qrcode from 'qrcode-terminal'; // No necesitas '{ error }' aquí si 'error' no es un export de qrcode-terminal
import pkg from 'whatsapp-web.js';

// Hacemos el cliente global
let client;

export async function IniciarWsp() {
    console.log('1. Iniciando IniciarWsp()...');
    const { Client, LocalAuth } = pkg;

    // Nuevo cliente de wsp
    client = new Client({
        authStrategy: new LocalAuth(), // Mantiene la sesión iniciada guardándola en local
        puppeteer: { // ¡Esto es CRUCIAL para el entorno sin GUI!
            headless: true, // Asegura que el navegador se ejecute sin interfaz
            args: [
                '--no-sandbox', // Necesario si ejecutas como root o en algunos entornos
                '--disable-setuid-sandbox', // Otra precaución de seguridad
                '--disable-extensions',
                '--disable-gpu', // Deshabilita el uso de la GPU (útil en servidores sin GPU)
                '--disable-dev-shm-usage', // Resuelve problemas de memoria compartida
                '--no-zygote', // Puede ayudar con el lanzamiento del proceso
                '--single-process' // Otra opción para la estabilidad del proceso
            ]
        }
    });

    console.log('2. Cliente de WhatsApp inicializado con configuración de Puppeteer.');

    // Genera QR
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

    // Avisa de conexión exitosa
    client.on('ready', () => {
        console.log('7. Conexión exitosa. El bot está en línea.');
        // setupMessageListener() // Escucho todo lo que entra
    });

    // Manejo de errores de autenticación
    client.on('auth_failure', msg => {
        console.error('8. Fallo en la autenticación:', msg);
        // Aquí podrías añadir lógica para limpiar la sesión guardada si es necesario
        // Por ejemplo: fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
    });

    // Manejo de desconexiones
    client.on('disconnected', reason => {
        console.warn('9. Cliente desconectado:', reason);
        // Puedes intentar reiniciar el cliente aquí
        // IniciarWsp();
    });

    // Intenta inicializar el cliente
    console.log('10. Llamando a client.initialize()...');
    client.initialize()
        .then(() => {
            console.log('11. client.initialize() completado exitosamente.');
        })
        .catch(err => {
            console.error('12. ERROR GRAVE al inicializar el cliente de WhatsApp:', err);
            console.error('13. Trace del error:', err.stack);
            console.error('Posibles causas: faltan dependencias de Chromium, problemas de permisos, falta de recursos.');
        });
}

// Exporta la instancia del cliente
export const getClient = () => {
    if (!client) {
        console.warn('14. Advertencia: Se intentó obtener el cliente de WhatsApp antes de inicializarlo.');
        throw new Error("Error, cliente no verificado"); // Cambié 'error' a 'Error' para ser un tipo de error estándar
    }
    return client;
};
