import db from "../config/db.js";

//
// VALIDATE LOCATION
//
function getLocation(country, city) {
  return db.prepare(`
    SELECT * FROM locations
    WHERE country_code = ? AND slug = ?
  `).get(country, city);
}

//
// LIST ADS FOR A LOCATION
//
export function listAdsByLocation(req, res) {
  const { country, city } = req.params;

  const location = getLocation(country, city);
  if (!location) return res.status(404).send("Unknown location");

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
    ads,
    location
  });
}

//
// SHOW NEW AD FORM
//
export function showNewAd(req, res) {
  const { country, city } = req.params;

  const location = getLocation(country, city);
  if (!location) return res.status(404).send("Unknown location");

  res.render("ads/new", {
    title: "Post New Ad",
    country,
    city,
    location,
    csrfToken: req.csrfToken()
  });
}

//
// CREATE AD (DRAFT)
//
export function createAd(req, res) {
  const { country, city } = req.params;
  const { title, body, category } = req.body;

  const location = getLocation(country, city);
  if (!location) return res.status(404).send("Unknown location");

  db.prepare(`
    INSERT INTO ads (user_id, title, body, category, location_slug, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).run(req.session.userId, title, body, category, city);

  res.redirect("/dashboard");
}

//
// VIEW A SINGLE AD
//
export function showAd(req, res) {
  const { id, country, city } = req.params;

  const location = getLocation(country, city);
  if (!location) return res.status(404).send("Unknown location");

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
    ad,
    location
  });
}

