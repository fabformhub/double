import db from "../config/db.js";

export const home = (req, res) => {
  try {
    const countries = db.prepare(`
      SELECT DISTINCT country_code
      FROM locations
      ORDER BY country_code ASC
    `).all();

    res.render("home", { countries });

  } catch (err) {
    console.error("Home controller error:", err);
    res.status(500).send("Server error");
  }
};

