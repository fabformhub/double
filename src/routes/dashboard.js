// src/routes/dashboard.js
import express from "express";
import { showDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

router.get("/", requireLogin, showDashboard);

export default router;

