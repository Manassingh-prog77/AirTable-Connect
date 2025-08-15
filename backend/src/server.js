// src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieSession from "cookie-session";
import path from "path";
import { fileURLToPath } from "url";


import authRoutes from "./routes/auth.routes.js";
import airtableRoutes from "./routes/airtable.routes.js";
import formsRoutes from "./routes/forms.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import publicFormsRouter from "./routes/forms.public.routes.js";
import formsExportRouter from "./routes/forms.export.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "https://mellow-gelato-b406ce.netlify.app",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieSession({
  name: "sid",
  keys: [process.env.SESSION_SECRET || "default-secret"],
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: "none"
}));

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// mount routes after session middleware
app.use("/api/auth", authRoutes);
app.use("/api/airtable", airtableRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public", publicFormsRouter);
app.use("/api", formsExportRouter);

app.get("/", (_req, res) => res.json({ ok: true }));

mongoose.connect("mongodb+srv://manasrajput2005:cVM0I7yyG6GwAaFc@cluster0.gbf3oun.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`)))
  .catch(err => { console.error("Mongo connection failed", err); process.exit(1); });
