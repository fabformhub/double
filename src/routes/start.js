import express from "express";
import { showStartPage } from "../controllers/startController.js";

const router = express.Router();

router.get("/start", showStartPage);

export default router;

