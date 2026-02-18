import express from "express";
import db from "../config/db.js";
import { about, contact } from "../controllers/pageController.js";

const router = express.Router();

// HOMEPAGE
router.get("/", (req, res) => {
  const countries = db.prepare("SELECT * FROM countries ORDER BY country_name ASC").all();
  res.render("home", { countries });
});

router.get("/about", about);
router.get("/contact", contact);

export default router;

