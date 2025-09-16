// routes/routes-messages.js
import { Router } from "express";
import { sendMessages, sendMessageGroup, getChatsInfo } from "../controllers/messages-wsp.js";

export const router = Router();

router.post("/api/whatsapp/send-message", sendMessages);
router.post("/api/whatsapp/send-message-group", sendMessageGroup);
router.get("/api/whatsapp/get-chats-info", getChatsInfo);