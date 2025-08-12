import express from "express";
import {
  playlistDownload,
  playlistInfo,
  videoDownload,
  videoInfo,
} from "../controllers/yt-controllers.js";

const ytRouter = express.Router();

ytRouter.get("/video/info", videoInfo);
ytRouter.get("/video/download", videoDownload);
ytRouter.get("/playlist/info", playlistInfo);
ytRouter.get("/playlist/download", playlistDownload);

export default ytRouter;