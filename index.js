import express from 'express';
import dotenv from 'dotenv';
import { router } from './routes/routes-messages.js';
import { IniciarWsp } from './controllers/iniciar-wsp.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", router)
await IniciarWsp();

app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});