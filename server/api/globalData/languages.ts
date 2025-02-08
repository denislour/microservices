import express from "express";
const router = express.Router();
import * as controller from "../../controller/api/globalData/languages.js";

router.get("/list", controller.getLanguagesList);
router.get("/listbyids", controller.getLanguagesByIds);
router.get("/array", controller.getArray);

export default router;
