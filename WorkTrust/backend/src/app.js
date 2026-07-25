import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";

const app = express();

/* ---------------- Security ---------------- */

app.use(helmet());

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/* ---------------- Body Parser ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- Cookies ---------------- */

app.use(cookieParser());

/* ---------------- Logger ---------------- */

app.use(morgan("dev"));

/* ---------------- Routes ---------------- */

app.use("/api/v1", healthRoutes);

/* ---------------- 404 ---------------- */

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;