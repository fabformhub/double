import express from "express";
import {
  showCountries,
  showCities,
  showCategories,
  showSubcategories,
  showAds,
  showAdDetail
} from "../controllers/adsBrowseController.js";

const router = express.Router();

/* -------------------------------------------
   PUBLIC AD BROWSING ROUTES
------------------------------------------- */

// Top-level: list all countries
router.get("/", showCountries);

// Country → list cities
router.get("/:country", showCities);

// City → list categories
router.get("/:country/:city", showCategories);

// Category → list subcategories
router.get("/:country/:city/:category", showSubcategories);

// Subcategory → list ads
router.get("/:country/:city/:category/:subcategory", showAds);

// Ad detail page
router.get("/:country/:city/:category/:subcategory/:id", showAdDetail);

export default router;

