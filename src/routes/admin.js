import express from "express";
import db from "../config/db.js";
import {
  approveAd,
  rejectAd,
  requestEdits,
  publishAd,
  archiveAd
} from "../controllers/adsModerationController.js";

const router = express.Router();

// Require admin
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.redirect("/login");
  next();
}

// REVIEW QUEUE
router.get("/review-queue", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'in-review'
    ORDER BY ads.created_at DESC
  `).all();

  res.render("admin/review-queue", { title: "Review Queue", ads });
});

// PUBLISHED
router.get("/published", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'published'
    ORDER BY ads.published_at DESC
  `).all();

  res.render("admin/published", { title: "Published Ads", ads });
});

// ARCHIVED
router.get("/archived", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'archived'
    ORDER BY ads.archived_at DESC
  `).all();

  res.render("admin/archived", { title: "Archived Ads", ads });
});

// FLAGGED
router.get("/flagged", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'flagged'
    ORDER BY ads.created_at DESC
  `).all();

  res.render("admin/flagged", { title: "Flagged Ads", ads });
});

// VIEW AD DETAILS
router.get("/ads/:id", requireAdmin, (req, res) => {
  const ad = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.id = ?
  `).get(req.params.id);

  if (!ad) return res.status(404).send("Ad not found");

  res.render("admin/view-ad", { title: "Review Ad", ad });
});

// ACTION ROUTES
router.post("/ads/:id/approve", requireAdmin, approveAd);
router.post("/ads/:id/reject", requireAdmin, rejectAd);
router.post("/ads/:id/request-edits", requireAdmin, requestEdits);
router.post("/ads/:id/publish", requireAdmin, publishAd);
router.post("/ads/:id/archive", requireAdmin, archiveAd);

export default router;

