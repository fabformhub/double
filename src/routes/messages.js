import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { inbox, thread, sendMessage } from "../controllers/messagesController.js";

const router = express.Router();

router.get("/", requireAuth, inbox);
router.get("/:id", requireAuth, thread);
router.post("/:id", requireAuth, sendMessage);

export default router;

