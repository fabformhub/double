import db from "../config/db.js";

export function showHome(req, res) {
  const locations = db.prepare(`
    SELECT * FROM locations
    ORDER BY country_code, city_name
  `).all();

  const grouped = {
    uk: [],
    ie: []
  };

  locations.forEach(loc => {
    grouped[loc.country_code].push(loc);
  });

  res.render("home", {
    title: "Choose Your Location",
    locations: grouped
  });
}

