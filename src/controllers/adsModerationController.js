import db from "../config/db.js";

// Allowed transitions for safety
const transitions = {
  draft: ["in-review"],
  "in-review": ["approved", "rejected", "needs-edit"],
  "needs-edit": ["in-review"],
  rejected: ["draft"],
  approved: ["published", "scheduled"],
  scheduled: ["published"],
  published: ["archived", "flagged"],
  flagged: ["approved", "rejected", "archived"],
  archived: []
};

function canTransition(from, to) {
  return transitions[from] && transitions[from].includes(to);
}

/* USER ACTION — Submit draft or edited ad for review */
export function submitForReview(req, res) {
  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);

  if (!ad || ad.user_id !== req.session.userId) {
    return res.status(403).send("Not allowed");
  }

  if (!canTransition(ad.status, "in-review")) {
    return res.status(400).send("Invalid state transition");
  }

  db.prepare(`
    UPDATE ads
    SET status = 'in-review',
        submitted_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(ad.id);

  res.redirect("/dashboard");
}

/* ADMIN ACTION — Approve ad */
export function approveAd(req, res) {
  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);

  if (!ad) return res.status(404).send("Ad not found");

  if (!canTransition(ad.status, "approved")) {
    return res.status(400).send("Invalid state transition");
  }

  db.prepare(`
    UPDATE ads
    SET status = 'approved',
        admin_reviewer_id = ?,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(req.session.userId, ad.id);

  res.redirect("/admin/review-queue");
}

/* ADMIN ACTION — Reject ad */
export function rejectAd(req, res) {
  const { notes } = req.body;

  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);
  if (!ad) return res.status(404).send("Ad not found");

  if (!canTransition(ad.status, "rejected")) {
    return res.status(400).send("Invalid state transition");
  }

  db.prepare(`
    UPDATE ads
    SET status = 'rejected',
        admin_reviewer_id = ?,
        admin_notes = ?,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(req.session.userId, notes || "Rejected by admin", ad.id);

  res.redirect("/admin/review-queue");
}

/* ADMIN ACTION — Request edits */
export function requestEdits(req, res) {
  const { notes } = req.body;

  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);
  if (!ad) return res.status(404).send("Ad not found");

  if (!canTransition(ad.status, "needs-edit")) {
    return res.status(400).send("Invalid state transition");
  }

  db.prepare(`
    UPDATE ads
    SET status = 'needs-edit',
        admin_reviewer_id = ?,
        admin_notes = ?,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(req.session.userId, notes || "Please edit and resubmit", ad.id);

  res.redirect("/admin/review-queue");
}

/* ADMIN ACTION — Publish ad */
export function publishAd(req, res) {
  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);
  if (!ad) return res.status(404).send("Ad not found");

  if (!canTransition(ad.status, "published")) {
    return res.status(400).send("Invalid state transition");
  }

  db.prepare(`
    UPDATE ads
    SET status = 'published',
        published_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(ad.id);

  res.redirect("/admin/published");
}

/* ADMIN ACTION — Archive ad */
export function archiveAd(req, res) {
  const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);
  if (!ad) return res.status(404).send("Ad not found");

  if (!canTransition(ad.status, "archived")) {
    return res.status(400).send("Invalid state transition");
  }

  db.prepare(`
    UPDATE ads
    SET status = 'archived',
        archived_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(ad.id);

  res.redirect("/admin/archived");
}

