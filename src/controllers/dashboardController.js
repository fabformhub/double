// src/controllers/dashboardController.js
import db from "../config/db.js";

export function showDashboard(req, res) {
  const userId = req.session.userId;

  const ads = db.prepare(`
    SELECT *
    FROM ads
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);

  const stats = {
    live: db.prepare(`
      SELECT COUNT(*) AS count
      FROM ads
      WHERE user_id = ? AND status = 'live'
    `).get(userId).count,

    drafts: db.prepare(`
      SELECT COUNT(*) AS count
      FROM ads
      WHERE user_id = ? AND status = 'draft'
    `).get(userId).count,

    messages: db.prepare(`
      SELECT COUNT(*) AS count
      FROM messages
      WHERE receiver_id = ?
    `).get(userId).count
  };

  res.render("dashboard/index", {
    title: "Your Dashboard",
    ads,
    stats
  });
}

