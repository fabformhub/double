import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Require admin login
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.status(403).send("Admins only");
  next();
}

// Helper to hydrate ads with location/category/subcategory names
function hydrateAds(rawAds) {
  return rawAds.map(ad => {
    const city = db.prepare(`SELECT city_name FROM locations WHERE slug = ?`).get(ad.location_slug);
    const cat = db.prepare(`SELECT name FROM categories WHERE slug = ?`).get(ad.category_slug);
    const sub = ad.subcategory_slug
      ? db.prepare(`SELECT name FROM subcategories WHERE slug = ?`).get(ad.subcategory_slug)
      : null;

    return {
      ...ad,
      city_name: city?.city_name || "",
      category_name: cat?.name || "",
      subcategory_name: sub?.name || null
    };
  });
}

//
// REVIEW QUEUE
//
router.get("/admin/review-queue", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'pending'
    ORDER BY ads.created_at ASC
  `).all();

  res.render("admin/review-queue", {
    ads: hydrateAds(ads)
  });
});

//
// PUBLISHED ADS
//
router.get("/admin/published", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'approved'
    ORDER BY ads.created_at DESC
  `).all();

  res.render("admin/published", {
    ads: hydrateAds(ads)
  });
});

//
// FLAGGED ADS
//
router.get("/admin/flagged", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username, ads.flag_reason
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.flag_reason IS NOT NULL
    ORDER BY ads.created_at DESC
  `).all();

  res.render("admin/flagged", {
    ads: hydrateAds(ads)
  });
});

//
// ARCHIVED ADS
//
router.get("/admin/archived", requireAdmin, (req, res) => {
  const ads = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.status = 'archived'
    ORDER BY ads.updated_at DESC
  `).all();

  res.render("admin/archived", {
    ads: hydrateAds(ads)
  });
});

//
// VIEW SINGLE AD
//
router.get("/admin/ad/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  const ad = db.prepare(`
    SELECT ads.*, users.username
    FROM ads
    JOIN users ON users.id = ads.user_id
    WHERE ads.id = ?
  `).get(id);

  if (!ad) return res.status(404).send("Ad not found");

  const hydrated = hydrateAds([ad])[0];

  // Optional flags table support
  let flags = [];
  try {
    flags = db.prepare(`
      SELECT * FROM flags WHERE ad_id = ? ORDER BY created_at DESC
    `).all(id);
  } catch (e) {
    // flags table doesn't exist — safe to ignore
  }

  res.render("admin/view-ad", {
    ad: hydrated,
    flags
  });
});

//
// ACTIONS
//

router.post("/admin/ad/:id/approve", requireAdmin, (req, res) => {
  db.prepare(`UPDATE ads SET status = 'approved', flag_reason = NULL WHERE id = ?`).run(req.params.id);
  res.redirect("/admin/review-queue");
});

router.post("/admin/ad/:id/reject", requireAdmin, (req, res) => {
  db.prepare(`UPDATE ads SET status = 'rejected' WHERE id = ?`).run(req.params.id);
  res.redirect("/admin/review-queue");
});

router.post("/admin/ad/:id/archive", requireAdmin, (req, res) => {
  db.prepare(`UPDATE ads SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
  res.redirect("/admin/published");
});

router.post("/admin/ad/:id/restore", requireAdmin, (req, res) => {
  db.prepare(`UPDATE ads SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
  res.redirect("/admin/archived");
});

router.post("/admin/ad/:id/remove", requireAdmin, (req, res) => {
  db.prepare(`DELETE FROM ads WHERE id = ?`).run(req.params.id);
  res.redirect("/admin/published");
});

router.post("/admin/ad/:id/clear-flags", requireAdmin, (req, res) => {
  db.prepare(`UPDATE ads SET flag_reason = NULL WHERE id = ?`).run(req.params.id);

  try {
    db.prepare(`DELETE FROM flags WHERE ad_id = ?`).run(req.params.id);
  } catch (e) {}

  res.redirect("/admin/flagged");
});

export default router;

