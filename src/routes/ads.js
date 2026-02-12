import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Require login
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

// Helper: resolve category + optional subcategory
function resolveCategory(categorySlug, subSlug) {
  const category = db.prepare(`
    SELECT * FROM categories WHERE slug = ?
  `).get(categorySlug);

  if (!category) return null;

  let subcategory = null;

  if (subSlug) {
    subcategory = db.prepare(`
      SELECT * FROM subcategories
      WHERE slug = ? AND category_id = ?
    `).get(subSlug, category.id);

    if (!subcategory) return null;
  }

  return { category, subcategory };
}

//
// LIST ADS
// Supports:
// /uk/mcr/msw/ads
// /uk/mcr/msw/st/ads
//
router.get("/:country/:city/:category/:subcategory?/ads", (req, res) => {
  const { country, city, category, subcategory } = req.params;

  const location = db.prepare(`
    SELECT * FROM locations
    WHERE slug = ? AND country_code = ?
  `).get(city, country);

  if (!location) return res.status(404).send("Location not found");

  const resolved = resolveCategory(category, subcategory);
  if (!resolved) return res.status(404).send("Category not found");

  const { category: catData, subcategory: subData } = resolved;

  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.location_slug = ?
      AND ads.category_slug = ?
      AND (? IS NULL OR ads.subcategory_slug = ?)
      AND ads.status = 'approved'
    ORDER BY ads.created_at DESC
  `).all(city, category, subcategory || null, subcategory || null);

  res.render("ads/index", {
    title: subData
      ? `${subData.name} — ${catData.name} in ${location.city_name}`
      : `${catData.name} in ${location.city_name}`,
    location,
    category: catData,
    subcategory: subData,
    ads
  });
});

//
// NEW AD FORM
//
router.get("/:country/:city/:category/:subcategory?/ads/new", requireLogin, (req, res) => {
  const { country, city, category, subcategory } = req.params;

  const resolved = resolveCategory(category, subcategory);
  if (!resolved) return res.status(404).send("Category not found");

  res.render("ads/new", {
    title: "Create Ad",
    country,
    city,
    category: resolved.category,
    subcategory: resolved.subcategory
  });
});

//
// CREATE AD
//
router.post("/:country/:city/:category/:subcategory?/ads/new", requireLogin, (req, res) => {
  const { country, city, category, subcategory } = req.params;
  const { title, body } = req.body;

  const resolved = resolveCategory(category, subcategory);
  if (!resolved) return res.status(404).send("Category not found");

  db.prepare(`
    INSERT INTO ads (user_id, title, body, category_slug, subcategory_slug, location_slug, status)
    VALUES (?, ?, ?, ?, ?, ?, 'draft')
  `).run(
    req.session.userId,
    title,
    body,
    category,
    subcategory || null,
    city
  );

  res.redirect("/dashboard");
});

//
// VIEW AD
//
router.get("/:country/:city/:category/:subcategory?/ads/:id", (req, res) => {
  const { id, city, category, subcategory } = req.params;

  const resolved = resolveCategory(category, subcategory);
  if (!resolved) return res.status(404).send("Category not found");

  const ad = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.id = ?
      AND ads.location_slug = ?
      AND ads.category_slug = ?
      AND (? IS NULL OR ads.subcategory_slug = ?)
  `).get(id, city, category, subcategory || null, subcategory || null);

  if (!ad) return res.status(404).send("Ad not found");

  res.render("ads/show", {
    title: ad.title,
    ad
  });
});

//
// EDIT AD
//
router.get("/:country/:city/:category/:subcategory?/ads/:id/edit", requireLogin, (req, res) => {
  const { id, city, category, subcategory } = req.params;

  const ad = db.prepare(`
    SELECT * FROM ads
    WHERE id = ?
      AND location_slug = ?
      AND category_slug = ?
      AND (? IS NULL OR subcategory_slug = ?)
  `).get(id, city, category, subcategory || null, subcategory || null);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  res.render("ads/edit", {
    title: "Edit Ad",
    ad
  });
});

//
// UPDATE AD
//
router.post("/:country/:city/:category/:subcategory?/ads/:id/edit", requireLogin, (req, res) => {
  const { id, city, category, subcategory } = req.params;
  const { title, body } = req.body;

  const ad = db.prepare(`
    SELECT * FROM ads
    WHERE id = ?
      AND location_slug = ?
      AND category_slug = ?
      AND (? IS NULL OR subcategory_slug = ?)
  `).get(id, city, category, subcategory || null, subcategory || null);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  db.prepare(`
    UPDATE ads
    SET title = ?, body = ?
    WHERE id = ?
  `).run(title, body, id);

  res.redirect("/dashboard");
});

export default router;

