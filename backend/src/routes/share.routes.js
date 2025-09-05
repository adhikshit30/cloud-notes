import { Router } from "express";
import crypto from "crypto";
import Share from "../models/Share.js";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

/* -------- PUBLIC READ-ONLY SHARE (no auth) -------- */
r.get("/public/:token", async (req, res) => {
  const s = await Share.findOne({ linkToken: req.params.token })
    .populate("noteId", "title content updatedAt");
  if (!s) return res.status(404).json({ error: "Invalid link" });
  return res.json({
    note: {
      title: s.noteId.title,
      content: s.noteId.content,
      updatedAt: s.noteId.updatedAt
    }
  });
});

/* -------- EVERYTHING BELOW STILL REQUIRES AUTH -------- */
r.use(requireAuth);

// create share link
r.post("/link/:noteId", async (req, res) => {
  const note = await Note.findOne({ _id: req.params.noteId, ownerId: req.user.id });
  if (!note) return res.status(404).json({ error: "Note not found" });
  const linkToken = crypto.randomBytes(16).toString("hex");
  const share = await Share.create({
    noteId: note._id, fromUserId: req.user.id, linkToken, canEdit: !!req.body.canEdit
  });
  res.json({ linkToken, shareId: share._id });
});

// resolve (auth-only version kept for now)
r.get("/link/:token", async (req, res) => {
  const s = await Share.findOne({ linkToken: req.params.token }).populate("noteId");
  if (!s) return res.status(404).json({ error: "Invalid link" });
  res.json({ note: s.noteId, canEdit: s.canEdit });
});

// direct email share (records intent)
r.post("/email/:noteId", async (req, res) => {
  const { toUserEmail, canEdit } = req.body || {};
  if (!toUserEmail) return res.status(400).json({ error: "toUserEmail required" });
  const note = await Note.findOne({ _id: req.params.noteId, ownerId: req.user.id });
  if (!note) return res.status(404).json({ error: "Note not found" });
  await Share.create({ noteId: note._id, fromUserId: req.user.id, toUserEmail, canEdit: !!canEdit });
  res.json({ ok: true });
});

export default r;
