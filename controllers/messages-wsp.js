// controllers/messages-wsp.js
import { getClient, isClientAuthenticated } from "./iniciar-wsp.js";

// Función auxiliar para manejar respuestas de error
const sendErrorResponse = (res, statusCode, message, details = null) => {
    console.error(`[API Error] ${statusCode}: ${message}`, details);
    const responseBody = { error: message };
    if (details) {
        responseBody.details = details.message || details.toString();
    }
    return res.status(statusCode).json(responseBody);
};

export async function sendMessages(req, res) {
    if (!isClientAuthenticated()) {
        return sendErrorResponse(res, 503, 'El bot de WhatsApp no está conectado o listo. Por favor, espere.');
    }

    const client = getClient();
    const { number, message } = req.body;

    if (!number || !message) {
        return sendErrorResponse(res, 400, 'Número y mensaje son requeridos.');
    }

    try {
        const chatId = number.endsWith('@c.us') ? number : `${number}@c.us`;
        const isRegistered = await client.isRegisteredUser(chatId);
        
        if (!isRegistered) {
            return sendErrorResponse(res, 404, `El número ${number} no es un usuario de WhatsApp registrado.`);
        }

        await client.sendMessage(chatId, message);
        console.log(`Mensaje enviado a ${number}: "${message}"`);
        res.status(201).json({ message: `Mensaje enviado a ${number}` });

    } catch (error) {
        sendErrorResponse(res, 500, `Fallo al enviar el mensaje: ${error.message}`, error);
    }
}

export async function sendMessageGroup(req, res) {
    if (!isClientAuthenticated()) {
        return sendErrorResponse(res, 503, 'El bot de WhatsApp no está conectado o listo. Por favor, espere.');
    }

    const client = getClient();
    const { groupName, message } = req.body;

    if (!groupName || !message) {
        return sendErrorResponse(res, 400, 'El nombre del grupo y el mensaje son requeridos.');
    }

    try {
        const chats = await client.getChats();
        const targetGroup = chats.find(
            chat => chat.isGroup && chat.name === groupName
        );

        if (!targetGroup) {
            return sendErrorResponse(res, 404, `No se encontró el grupo con el nombre: "${groupName}".`);
        }

        const groupId = targetGroup.id._serialized;
        await client.sendMessage(groupId, message);

        console.log(`Mensaje enviado al grupo "${groupName}" (ID: ${groupId})`);
        res.status(201).json({
            status: 'success',
            message: `Mensaje enviado al grupo "${groupName}" exitosamente.`,
            chatId: groupId
        });

    } catch (error) {
        sendErrorResponse(res, 500, `Error al enviar el mensaje al grupo: ${error.message}`, error);
    }
}

export async function getChatsInfo(req, res) {
    if (!isClientAuthenticated()) {
        return sendErrorResponse(res, 503, 'El bot de WhatsApp no está conectado o listo.');
    }

    const client = getClient();

    try {
        const chats = await client.getChats();
        const groups = [];
        const individuals = [];

        chats.forEach(chat => {
            if (chat.isGroup) {
                groups.push({
                    name: chat.name,
                    chatId: chat.id._serialized
                });
            } else {
                individuals.push({
                    name: chat.name || 'Sin nombre',
                    chatId: chat.id._serialized
                });
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Lista de chats (grupos e individuos) obtenida exitosamente.',
            groups,
            individuals
        });
    } catch (error) {
        sendErrorResponse(res, 500, `Error al obtener la lista de chats: ${error.message}`, error);
    }
}