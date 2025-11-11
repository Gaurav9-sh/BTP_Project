// Backend/Routes/hod.js
import express from "express";
import Course from "../Models/Courses.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("HOD", "ADMIN"));

// List courses (HOD sees only their dept; ADMIN sees all)
router.get("/courses", async (req, res) => {
  const { status } = req.query;
  const q = {};
  if (req.user.role !== "ADMIN") q.department = req.user.department;
  if (status) q.hodStatus = status;
  const items = await Course.find(q).sort({ semester: 1, CCODE: 1 }).lean();
  res.json(items);
});

// Approve
router.patch("/courses/:id/approve", async (req, res) => {
  const c = await Course.findById(req.params.id);
  if (!c) return res.status(404).end();
  if (req.user.role !== "ADMIN" && c.department !== req.user.department)
    return res.status(403).json({ message: "Cross-department denied" });

  c.hodStatus = "approved";
  c.hodComment = "";
  c.hodBy = req.user.email;
  c.hodAt = new Date();
  await c.save();
  res.json(c.toObject());
});

// Request changes
router.patch("/courses/:id/request-changes", async (req, res) => {
  const { comment } = req.body || {};
  const c = await Course.findById(req.params.id);
  if (!c) return res.status(404).end();
  if (req.user.role !== "ADMIN" && c.department !== req.user.department)
    return res.status(403).json({ message: "Cross-department denied" });

  c.hodStatus = "changes";
  c.hodComment = comment || "";
  c.hodBy = req.user.email;
  c.hodAt = new Date();
  await c.save();
  res.json(c.toObject());
});

// Lock/Unlock (only if approved)
router.patch("/courses/:id/lock", async (req, res) => {
  const { lock } = req.body || {};
  const c = await Course.findById(req.params.id);
  if (!c) return res.status(404).end();
  if (req.user.role !== "ADMIN" && c.department !== req.user.department)
    return res.status(403).json({ message: "Cross-department denied" });
  if (c.hodStatus !== "approved")
    return res.status(400).json({ message: "Only approved can be locked" });

  c.isLocked = !!lock;
  await c.save();
  res.json(c.toObject());
});

export default router;
