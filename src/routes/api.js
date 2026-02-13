import express from "express";
import {
  getCountries,
  getCities,
 getCategories,
  getSubcategories
} from "../controllers/apiController.js";

const router = express.Router();

router.get("/countries", getCountries);
router.get("/cities", getCities);
router.get("/categories", getCategories);
router.get("/subcategories", getSubcategories);

export default router;

