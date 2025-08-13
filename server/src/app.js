import express from "express";
import cors from "cors";
import morgan from "morgan";
import cron from "node-cron";

import "dotenv/config";
import ytRouter from "./routers/yt-routes.js";
import { delete1DayOldFiles } from "./utils/r2Client.js";
import tiktokRouter from "./routers/tiktok-routes.js";

const app = express();

// Middleware (optional)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors("*")); // Allow all origins, adjust as needed
app.use(morgan("dev"));

cron.schedule("0 * * * *", () => {
  console.log("⏳ Cron job running every hour:", new Date().toLocaleString());
  delete1DayOldFiles()
    .then(() => console.log("✅ Old files deleted successfully."))
    .catch((error) => console.error("❌ Error deleting old files:", error));
});

// Routes (example)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/yt", ytRouter);
app.use("/tiktok", tiktokRouter);

export default app;
