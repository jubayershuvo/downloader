import express from "express";
import {
  videoDownload,
  videoInfo,
} from "../controllers/fb-controllers.js";

const fbRouter = express.Router();

fbRouter.get("/video/info", videoInfo);
fbRouter.get("/video/download", videoDownload);

export default fbRouter;