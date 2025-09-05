import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";

const r = Router();

const registerSchema = z.object({
name: z.string().min(1),
email: z.string().email(),
password: z.string().min(6)
});

r.post("/register", async (req, res) => {
const parsed = registerSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
const { name, email, password } = parsed.data;

const exists = await User.findOne({ email });
if (exists) return res.status(409).json({ error: "Email already registered" });

const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, passwordHash });
return res.json({ id: user._id, email: user.email, name: user.name });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

r.post("/login", async (req, res) => {
const parsed = loginSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
const { email, password } = parsed.data;

const user = await User.findOne({ email });
if (!user || !(await bcrypt.compare(password, user.passwordHash)))
return res.status(401).json({ error: "Invalid credentials" });

const token = jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

export default r;