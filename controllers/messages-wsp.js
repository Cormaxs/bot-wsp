import { getClient } from "./iniciar-wsp.js"; // Asegúrate de que la ruta sea correcta

export async function sendMessages(req, res) { 
    const client = getClient();    // Accedo al cliente verificado
    const {number, message} = req.body; //recupero todos los valores deseados, podes agregar los que quieras
    const chatId = number.endsWith('@c.us') ? number : `${number}@c.us`; // Formatea el número: añade @c.us si no está presente TODO DEBE SER STING

    try {
        // Verifica si el número es un usuario de WhatsApp válido y registrado
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            throw new Error(`El número ${number} no es un usuario de WhatsApp registrado.`);
        }
        await client.sendMessage(chatId, message);// Envía el mensaje con los datos ya verificados
        console.log(`Mensaje enviado a ${number}: "${message}"`);
        res.status(201).json({ message: `Mensaje enviado a ${number}, contenido: ${message}` });
    } catch (error) {
        // Captura y registra cualquier error durante el envío
        console.error('Error al enviar el mensaje:', error.message);
        throw new error; 
    }
}


export async function sendMessageGroup(req, res) {
    const { groupName, message } = req.body; // Ahora esperamos groupName y message
    
    // --- Validaciones iniciales de los parámetros ---
    if (typeof groupName !== 'string' || groupName.trim() === '') {
        return res.status(400).json({ error: 'El nombre del grupo (groupName) no es válido o está vacío.' });
    }
    if (typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'El mensaje no es válido o está vacío.' });
    }

    const client = getClient();

    try {
        // Sacar el ID del grupo por su nombre ---
        const chats = await client.getChats();

        // Buscar el grupo por su nombre
        const targetGroup = chats.find(
            chat => chat.isGroup && chat.name === groupName
        );
        if (!targetGroup) {
            // Si el grupo no se encuentra, respondemos con un error 404
            console.warn(`No se encontró ningún grupo con el nombre: "${groupName}".`);
            return res.status(404).json({ error: `No se encontró el grupo con el nombre: "${groupName}". Asegurate de que el bot sea miembro de este grupo y el nombre sea exacto.` });
        }

        const groupId = targetGroup.id._serialized; // Obtenemos el chatId del grupo encontrado
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
        res.status(500).json({ error: `Error interno del servidor al intentar enviar el mensaje: ${error.message}` });
    }
}