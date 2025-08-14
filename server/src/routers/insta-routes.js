import express from "express";
import {
  videoDownload,
  videoInfo,
} from "../controllers/insta-controllers.js";

const instaRouter = express.Router();

instaRouter.get("/video/info", videoInfo);
instaRouter.get("/video/download", videoDownload);

export default instaRouter;