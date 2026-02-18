
import express from "express";
import { about, contact } from "../controllers/pageController.js";

const router = express.Router();

router.get("/about", about);
router.get("/contact", contact);


export default router;
