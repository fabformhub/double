import express from "express";
import { showLogin, showSignup, signup, login, logout } from "../controllers/authController.js";

const router = express.Router();

router.get("/login", showLogin);
router.post("/login", login);

router.get("/signup", showSignup);
router.post("/signup", signup);

router.get("/logout", logout);

export default router;
