import { Router } from "express";
import { getSettings, updateSettings, getAnalytics } from "../controllers/settingsController.js";

const router = Router();

router.route("/").get(getSettings).put(updateSettings);
router.get("/analytics", getAnalytics);

export default router;
