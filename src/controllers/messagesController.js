import db from "../config/db.js";

export function inbox(req, res) {
  const threads = db.prepare(
    `SELECT m.*, u.username AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.recipient_id = ?
     GROUP BY m.sender_id
     ORDER BY m.created_at DESC`
  ).all(req.session.userId);

  res.render("messages/inbox", { title: "Inbox", threads });
}

export function thread(req, res) {
  const messages = db.prepare(
    `SELECT m.*, u.username AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE (sender_id = ? AND recipient_id = ?)
        OR (sender_id = ? AND recipient_id = ?)
     ORDER BY m.created_at ASC`
  ).all(req.session.userId, req.params.id, req.params.id, req.session.userId);

  res.render("messages/thread", {
    title: "Conversation",
    messages,
    otherUserId: req.params.id
  });
}

export function sendMessage(req, res) {
  const { body } = req.body;

  db.prepare(
    "INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)"
  ).run(req.session.userId, req.params.id, body);

  res.redirect(`/messages/${req.params.id}`);
}

