import express from "express";
import { renderCheckout, paymentSuccess } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/checkout", renderCheckout);
router.get("/payment-success", paymentSuccess);

export default router;

