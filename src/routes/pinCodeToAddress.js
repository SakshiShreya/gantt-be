import express from "express";
import pinCodeToAddress from "../controllers/pinCodeToAddress/index.js";

const router = express.Router();

router.route("/v1/:pinCode").get(pinCodeToAddress);

export default router;
