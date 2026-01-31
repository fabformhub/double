import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Require login
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

router.get("/", requireLogin, (req, res) => {
  const userId = req.session.userId;

  const ads = db.prepare(`
    SELECT *
    FROM ads
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);

  res.render("dashboard/index", {
    title: "Your Ads",
    ads
  });
});

export default router;

