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

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "cloud-notes-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/shares", shareRoutes);

const PORT = process.env.PORT || 8080;
connectDB().then(() => {
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}).catch(err => {
console.error("DB connection failed", err);
process.exit(1);
});