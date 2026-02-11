import express from "express";
import db from "../config/db.js";
import { submitForReview } from "../controllers/adsModerationController.js";

const router = express.Router();

// Require login
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

//
// LIST ADS FOR A LOCATION
//
//
// LIST ADS FOR A LOCATION
//
router.get("/:country/:city/ads", (req, res) => {
  const { country, city } = req.params;

  // Fetch location info
  const location = db.prepare(`
    SELECT *
    FROM locations
    WHERE slug = ?
      AND country_code = ?
  `).get(city, country);

  if (!location) {
    return res.status(404).send("Location not found");
  }

  // Fetch ads for this location
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.location_slug = ?
      AND ads.status = 'approved'
    ORDER BY ads.created_at DESC
  `).all(city);

  res.render("ads/index", {
    title: `Ads in ${location.city_name}`,
    location,
    ads
  });
});


//
// NEW AD FORM
//
router.get("/:country/:city/ads/new", requireLogin, (req, res) => {
  const { country, city } = req.params;

  res.render("ads/new", {
    title: "Create Ad",
    country,
    city
  });
});

//
// CREATE AD (saved as draft)
//
router.post("/:country/:city/ads/new", requireLogin, (req, res) => {
  const { country, city } = req.params;
  const { title, body, category } = req.body;

  db.prepare(`
    INSERT INTO ads (user_id, title, body, category, location_slug, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).run(req.session.userId, title, body, category, city);

  res.redirect("/dashboard");
});

//
// EDIT FORM
//
router.get("/:country/:city/ads/:id/edit", requireLogin, (req, res) => {
  const { id, city } = req.params;

  const ad = db.prepare(`
    SELECT * FROM ads
    WHERE id = ? AND location_slug = ?
  `).get(id, city);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  res.render("ads/edit", {
    title: "Edit Ad",
    ad,
    city
  });
});

//
// UPDATE AD
//
router.post("/:country/:city/ads/:id/edit", requireLogin, (req, res) => {
  const { id, city } = req.params;
  const { title, body, category } = req.body;

  const ad = db.prepare(`
    SELECT * FROM ads
    WHERE id = ? AND location_slug = ?
  `).get(id, city);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  db.prepare(`
    UPDATE ads
    SET title = ?, body = ?, category = ?
    WHERE id = ?
  `).run(title, body, category, id);

  res.redirect("/dashboard");
});

//
// SUBMIT FOR REVIEW
//
router.post("/:country/:city/ads/:id/submit", requireLogin, submitForReview);

//
// VIEW A SINGLE AD
//
router.get("/:country/:city/ads/:id", (req, res) => {
  const { id, city } = req.params;

  const ad = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.id = ?
      AND ads.location_slug = ?
  `).get(id, city);

  if (!ad) return res.status(404).send("Ad not found");

  res.render("ads/show", {
    title: ad.title,
    ad
  });
});

export default router;

