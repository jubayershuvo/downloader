import express from "express";
import cors from "cors";
import morgan from "morgan";

import 'dotenv/config';
import ytRouter from "./routers/yt-routes.js";

const app = express();


// Middleware (optional)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors('*')); // Allow all origins, adjust as needed
app.use(morgan("dev"));

// Routes (example)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/yt", ytRouter);

export default app;
