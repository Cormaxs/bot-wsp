import { Router } from "express";
import { sendMessages , sendMessageGroup} from "../controllers/messages-wsp.js";

export const router = Router();


router.post("/api/whatsapp/send-message", sendMessages)//envia un mensaje a un individuo, se espera un input de  number y message 
router.post("/api/whatsapp/send-message-group",sendMessageGroup )//envia mensaje a un grupo en particular
