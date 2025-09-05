import { Router } from "express";
import { z } from "zod";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

const upsertSchema = z.object({ title: z.string().default("Untitled"), content: z.string().default("") });

// Create
r.post("/", async (req, res) => {
const parsed = upsertSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
const note = await Note.create({ ownerId: req.user.id, ...parsed.data });
res.json(note);
});

// List
r.get("/", async (req, res) => {
const notes = await Note.find({ ownerId: req.user.id }).sort({ updatedAt: -1 });
res.json(notes);
});

// Read
r.get("/:id", async (req, res) => {
const n = await Note.findOne({ _id: req.params.id, ownerId: req.user.id });
if (!n) return res.status(404).json({ error: "Not found" });
res.json(n);
});

// Update
r.put("/:id", async (req, res) => {
const parsed = upsertSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
const updated = await Note.findOneAndUpdate(
{ _id: req.params.id, ownerId: req.user.id },
{ $set: parsed.data },
{ new: true }
);
if (!updated) return res.status(404).json({ error: "Not found" });
res.json(updated);
});

// Delete
r.delete("/:id", async (req, res) => {
await Note.deleteOne({ _id: req.params.id, ownerId: req.user.id });
res.json({ ok: true });
});

export default r;