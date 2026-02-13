import express from "express";
import {
  listAds,
  showNewAd,
  createAd,
  showAd,
  editAd,
  updateAd
} from "../controllers/adsController.js";

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

router.get("/:country/:city/:category/:subcategory?/ads", listAds);
router.get("/:country/:city/:category/:subcategory?/ads/new", requireLogin, showNewAd);
router.post("/:country/:city/:category/:subcategory?/ads/new", requireLogin, createAd);
router.get("/:country/:city/:category/:subcategory?/ads/:id", showAd);
router.get("/:country/:city/:category/:subcategory?/ads/:id/edit", requireLogin, editAd);
router.post("/:country/:city/:category/:subcategory?/ads/:id/edit", requireLogin, updateAd);

export default router;

