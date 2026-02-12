import express from "express";
import db from "../config/db.js";

const router = express.Router();

// CITY LANDING PAGE
// /uk/mcr
router.get("/:country/:city", (req, res) => {
  const { country, city } = req.params;

  const location = db.prepare(`
    SELECT * FROM locations
    WHERE slug = ? AND country_code = ?
  `).get(city, country);

  if (!location) return res.status(404).send("Location not found");

  const categories = db.prepare(`
    SELECT * FROM categories
    ORDER BY id ASC
  `).all();

  res.render("locations/show", {
    title: `${location.city_name} — Categories`,
    location,
    categories
  });
});

// CATEGORY LANDING PAGE (shows subcategories if any)
// /uk/mcr/msw
router.get("/:country/:city/:category", (req, res) => {
  const { country, city, category } = req.params;

  const location = db.prepare(`
    SELECT * FROM locations
    WHERE slug = ? AND country_code = ?
  `).get(city, country);

  if (!location) return res.status(404).send("Location not found");

  const categoryData = db.prepare(`
    SELECT * FROM categories
    WHERE slug = ?
  `).get(category);

  if (!categoryData) return res.status(404).send("Category not found");

  const subcategories = db.prepare(`
    SELECT * FROM subcategories
    WHERE category_id = ?
    ORDER BY id ASC
  `).all(categoryData.id);

  res.render("categories/show", {
    title: `${categoryData.name} — ${location.city_name}`,
    location,
    category: categoryData,
    subcategories
  });
});

export default router;

