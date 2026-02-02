import express from "express";
import db from "../config/db.js";
import { listAds } from "../controllers/adsController.js";
import { submitForReview } from "../controllers/adsModerationController.js";

const router = express.Router();

// LIST ALL ADS  ← THIS WAS MISSING
router.get("/", listAds);

// Require login
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

// CREATE FORM
router.get("/new", requireLogin, (req, res) => {
  res.render("ads/new", { title: "Create Ad" });
});

// CREATE AD (save as draft)
router.post("/new", requireLogin, (req, res) => {
  const { title, body, category, location } = req.body;

  db.prepare(`
    INSERT INTO ads (user_id, title, body, category, location, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).run(req.session.userId, title, body, category, location);

  res.redirect("/dashboard");
});

// EDIT FORM
router.get("/:id/edit", requireLogin, (req, res) => {
  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  res.render("ads/edit", { title: "Edit Ad", ad });
});

// UPDATE AD
router.post("/:id/edit", requireLogin, (req, res) => {
  const { title, body, category, location } = req.body;

  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  db.prepare(`
    UPDATE ads
    SET title = ?, body = ?, category = ?, location = ?
    WHERE id = ?
  `).run(title, body, category, location, ad.id);

  res.redirect("/dashboard");
});

// SUBMIT FOR REVIEW
router.post("/:id/submit", requireLogin, submitForReview);

// VIEW A SINGLE AD
router.get("/:id", (req, res) => {
  const ad = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.id = ?
  `).get(req.params.id);

  if (!ad) return res.status(404).send("Ad not found");

  res.render("ads/show", { title: ad.title, ad });
});

export default router;

