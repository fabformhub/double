import db from "../config/db.js";

export function listAds(req, res) {
  const ads = db.prepare("SELECT * FROM ads ORDER BY created_at DESC").all();
  console.log("ADS FROM DB:", ads);
  res.render("ads/index", { title: "Ads", ads });
}

export function showNewAd(req, res) {
  res.render("ads/new", {
    title: "Post New Ad",
    csrfToken: req.csrfToken()
  });
}

export function createAd(req, res) {
  const { title, body, category, location } = req.body;

  db.prepare(
    "INSERT INTO ads (user_id, title, body, category, location) VALUES (?, ?, ?, ?, ?)"
  ).run(req.session.userId, title, body, category, location);

  res.redirect("/ads");
}

export function showAd(req, res) {
  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);

  if (!ad) return res.status(404).send("Ad not found");

  res.render("ads/show", { title: ad.title, ad });
}

