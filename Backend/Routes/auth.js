import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

const router = express.Router();

// POST /api/auth/login  -> { token, user }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email }).lean();
  if (!u) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: u._id, email: u.email, name: u.name, role: u.role, department: u.department },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { name: u.name, email: u.email, role: u.role, department: u.department }
  });
});

export default router;
