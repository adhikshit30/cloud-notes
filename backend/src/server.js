import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";
import shareRoutes from "./routes/share.routes.js";

dotenv.config();
const app = express();

/* ---- CORS: allow multiple origins (local + prod) ---- */
const allowed = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (curl/Postman) which send no Origin
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "cloud-notes-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/shares", shareRoutes);

const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API listening on :${PORT}`)))
  .catch(err => {
    console.error("DB connection failed", err);
    process.exit(1);
  });
