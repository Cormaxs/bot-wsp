import qrcode, { error } from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
//import { sendMessages } from './messages-wsp.js';

//hacemos el cliente global
let client;
export async function IniciarWsp(){
    const { Client, LocalAuth } = pkg;
    //nuevo cliente de wsp
     client = new Client({
        authStrategy: new LocalAuth()//mantiene la sesion iniciada guardandola en local
    });
    //genera qr
    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });
    //avisa de coneccion exitosa
    client.on('ready', () => {
        console.log('Conexion exitosa. El bot esta en linea');
        //setupMessageListener()//escucho todo lo que entra
    });
    //mantiene el cliente inicializado
    client.initialize();
}

// escucha todos los mensajes entrantes 
/*
 function setupMessageListener() {
    if (!client) {
        console.error('No se puede configurar el escuchador de mensajes: el cliente de WhatsApp no está inicializado.');
        throw new error("Error en setupMessageListener(), cliente no verificado")
    }
    client.on('message', async message => {
        console.log(`Mensaje recibido de ${message.from}: ${message.body}`); });
}*/


// Exporta la instancia del cliente
export const getClient = () => {
    // Si necesitas asegurarte de que el cliente esté inicializado antes de usarlo.
    if (!client) {
        console.warn('Advertencia: Se intentó obtener el cliente de WhatsApp antes de inicializarlo.');
        throw new error("Error, cliente no verificado")
    }
    //retorna el cliente verificado de que esta iniciado
    return client;
};
