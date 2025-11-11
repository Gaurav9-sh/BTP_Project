import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

const router = express.Router();

// --- ADD THIS NEW /REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create new user
    user = new User({
      name,
      email,
      passwordHash,
      role,
      department: role === "HOD" ? department : "" // Only HODs need a department
    });

    // 4. Save to database
    await user.save();
    res.status(201).json({ message: "User created successfully", user });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

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
