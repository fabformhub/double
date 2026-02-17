import db from "../config/db.js";

/* -------------------------------------------
   SHOW ALL COUNTRIES (Top-level entry)
------------------------------------------- */
export const showCountries = (req, res) => {
  const countries = db.prepare(`
    SELECT country_code, country_name, flag_emoji
    FROM countries
    ORDER BY sort_order ASC, country_name ASC
  `).all();

  res.render("adsBrowse/countries", { countries });
};

/* -------------------------------------------
   SHOW ALL CITIES IN A COUNTRY
------------------------------------------- */
export const showCities = (req, res) => {
  const { country } = req.params;

  const countryRow = db.prepare(`
    SELECT country_name, flag_emoji
    FROM countries
    WHERE country_code = ?
  `).get(country);

  if (!countryRow) return res.status(404).send("Country not found");

  const cities = db.prepare(`
    SELECT city_name, slug
    FROM locations
    WHERE country_code = ?
    ORDER BY city_name ASC
  `).all(country);

  res.render("adsBrowse/cities", {
    country,
    countryName: countryRow.country_name,
    flag: countryRow.flag_emoji,
    cities
  });
};

/* -------------------------------------------
   SHOW ALL CATEGORIES IN A CITY
------------------------------------------- */
export const showCategories = (req, res) => {
  const { country, city } = req.params;

  const cityRow = db.prepare(`
    SELECT city_name
    FROM locations
    WHERE slug = ?
  `).get(city);

  if (!cityRow) return res.status(404).send("City not found");

  const categories = db.prepare(`
    SELECT name, slug
    FROM categories
    ORDER BY name ASC
  `).all();

  res.render("adsBrowse/categories", {
    country,
    city,
    cityName: cityRow.city_name,
    categories
  });
};

/* -------------------------------------------
   SHOW ALL SUBCATEGORIES IN A CATEGORY
------------------------------------------- */
export const showSubcategories = (req, res) => {
  const { category } = req.params;

  const cat = db.prepare(`
    SELECT id, name
    FROM categories
    WHERE slug = ?
  `).get(category);

  if (!cat) return res.status(404).send("Category not found");

  const subcategories = db.prepare(`
    SELECT name, slug
    FROM subcategories
    WHERE category_id = ?
    ORDER BY name ASC
  `).all(cat.id);

  res.render("adsBrowse/subcategories", {
    ...req.params,
    categoryName: cat.name,
    subcategories
  });
};

/* -------------------------------------------
   SHOW ALL ADS IN A SUBCATEGORY (Paginated)
------------------------------------------- */
export const showAds = (req, res) => {
  const { country, city, category, subcategory } = req.params;

  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const ads = db.prepare(`
    SELECT *
    FROM ads
    WHERE location_slug = ?
      AND category_slug = ?
      AND subcategory_slug = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(city, category, subcategory, limit, offset);

  const total = db.prepare(`
    SELECT COUNT(*) AS count
    FROM ads
    WHERE location_slug = ?
      AND category_slug = ?
      AND subcategory_slug = ?
  `).get(city, category, subcategory).count;

  const totalPages = Math.ceil(total / limit);

  res.render("adsBrowse/ads", {
    ...req.params,
    ads,
    page,
    totalPages
  });
};

/* -------------------------------------------
   SHOW A SINGLE AD (Public View)
------------------------------------------- */
export const showAdDetail = (req, res) => {
  const ad = db.prepare(`
    SELECT *
    FROM ads
    WHERE id = ?
  `).get(req.params.id);

  if (!ad) return res.status(404).send("Ad not found");

  res.render("adsBrowse/ad", { ad });
};

