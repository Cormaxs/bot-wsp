// messages-wsp.js
import { getClient, isClientAuthenticated } from "./iniciar-wsp.js"; // <-- AGREGADO: Importar isClientAuthenticated

// Función auxiliar para manejar respuestas de error (mejorada)
const sendErrorResponse = (res, statusCode, message, details = null) => {
    console.error(`[API Error] ${statusCode}: ${message}`, details);
    const responseBody = { error: message };
    if (details) {
        responseBody.details = details.message || details.toString();
        if (details.stack) {
            console.error("Stack Trace:", details.stack); // Log del stack trace solo en el servidor
        }
    }
    return res.status(statusCode).json(responseBody);
};

export async function sendMessages(req, res) {
    // 1. Verificar si el cliente de WhatsApp está listo para usar
    if (!isClientAuthenticated()) { // <-- Usamos la nueva función
        return sendErrorResponse(res, 503, 'El bot de WhatsApp no está conectado o listo. Por favor, espere y asegúrese de que el QR fue escaneado.');
    }

    const client = getClient(); // Obtenemos el cliente SOLO si está listo

    const { number, message } = req.body;
    // Formatea el número: añade @c.us si no está presente
    const chatId = number.endsWith('@c.us') ? number : `${number}@c.us`;

    if (!number || !message) {
        return sendErrorResponse(res, 400, 'Número y mensaje son requeridos.');
    }

    try {
        // Verifica si el número es un usuario de WhatsApp válido y registrado
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            return sendErrorResponse(res, 404, `El número ${number} no es un usuario de WhatsApp registrado.`);
        }

        // Envía el mensaje con los datos ya verificados
        await client.sendMessage(chatId, message);
        console.log(`Mensaje enviado a ${number}: "${message}"`);
        res.status(201).json({ message: `Mensaje enviado a ${number}, contenido: ${message}` });

    } catch (error) {
        // Captura y registra cualquier error durante el envío
        console.error('Error al enviar el mensaje:', error.message);
        // Este error de 'getChats' en el mensaje de grupo se debía a que client no estaba listo
        // Ahora, si hay un error al enviar el mensaje (ej. WhatsApp desconectado), lo capturamos aquí.
        sendErrorResponse(res, 500, `Fallo al enviar el mensaje: ${error.message}`, error);
    }
}


export async function sendMessageGroup(req, res) {
    // 1. Verificar si el cliente de WhatsApp está listo para usar
    if (!isClientAuthenticated()) { // <-- Usamos la nueva función
        return sendErrorResponse(res, 503, 'El bot de WhatsApp no está conectado o listo. Por favor, espere y asegúrese de que el QR fue escaneado.');
    }

    const client = getClient(); // Obtenemos el cliente SOLO si está listo

    const { groupName, message } = req.body;

    // --- Validaciones iniciales de los parámetros ---
    if (typeof groupName !== 'string' || groupName.trim() === '') {
        return sendErrorResponse(res, 400, 'El nombre del grupo (groupName) no es válido o está vacío.');
    }
    if (typeof message !== 'string' || message.trim() === '') {
        return sendErrorResponse(res, 400, 'El mensaje no es válido o está vacío.');
    }

    try {
        // Sacar el ID del grupo por su nombre ---
        // AHORA: client.getChats() no debería ser undefined si isClientAuthenticated() es true
        const chats = await client.getChats();
        console.log(`Chats obtenidos. Número de chats: ${chats.length}`); // <-- AGREGADO para depurar

        // Buscar el grupo por su nombre
        const targetGroup = chats.find(
            chat => chat.isGroup && chat.name === groupName
        );
        if (!targetGroup) {
            console.warn(`No se encontró ningún grupo con el nombre: "${groupName}".`);
            return sendErrorResponse(res, 404, `No se encontró el grupo con el nombre: "${groupName}". Asegúrate de que el bot sea miembro de este grupo y el nombre sea exacto.`);
        }

        const groupId = targetGroup.id._serialized;
        console.log(`Grupo encontrado: "${groupName}" con chatId: ${groupId}`);

        // --- Paso 2: Enviar el mensaje al grupo encontrado ---
        await client.sendMessage(groupId, message);
        console.log(`Mensaje enviado al grupo "${groupName}" (ID: ${groupId}): "${message}"`);

        // --- Respuesta exitosa ---
        res.status(201).json({
            status: 'success',
            message: `Mensaje enviado al grupo "${groupName}" exitosamente.`,
            chatId: groupId
        });

    } catch (error) {
        // --- Manejo de errores durante el proceso de envío ---
        console.error('Error al enviar el mensaje al grupo:', error.message);
        sendErrorResponse(res, 500, `Error interno del servidor al intentar enviar el mensaje al grupo: ${error.message}`, error);
    }
}

