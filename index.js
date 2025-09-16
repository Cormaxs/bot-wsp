// index.js
import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes/routes-messages.js';
import { IniciarWsp } from './controllers/iniciar-wsp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Inicia el bot de WhatsApp y pasa una función de callback.
// El servidor Express solo se iniciará cuando el bot esté listo.
IniciarWsp(() => {
    // Aquí es donde se configura e inicia el servidor Express
    app.use("/", router);
    app.listen(PORT, () => {
        console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    });
});