import express from "express";
import { videoDownload, videoInfo } from "../controllers/tiktok-controllers.js";

const tiktokRouter = express.Router();

tiktokRouter.get("/video/info", videoInfo);
tiktokRouter.get("/video/download", videoDownload);

export default tiktokRouter;
