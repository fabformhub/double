import db from "../config/db.js";

export function getCountries(req, res) {
  const rows = db.prepare(`
    SELECT DISTINCT country_code AS code
    FROM locations
    ORDER BY country_code
  `).all();

  res.json(rows);
}

export function getCities(req, res) {
  const { country } = req.query;

  if (!country) {
    return res.status(400).json({ error: "country is required" });
  }

  const rows = db.prepare(`
    SELECT city_name AS name, slug
    FROM locations
    WHERE country_code = ?
    ORDER BY city_name
  `).all(country);

  res.json(rows);
}

export function getCategories(req, res) {
  const rows = db.prepare(`
    SELECT id, name, slug
    FROM categories
    ORDER BY name
  `).all();

  res.json(rows);
}

export function getSubcategories(req, res) {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: "category is required" });
  }

  const rows = db.prepare(`
    SELECT id, name, slug
    FROM subcategories
    WHERE category_id = ?
    ORDER BY name
  `).all(category);

  res.json(rows);
}

