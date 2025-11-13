import express from "express";
import Course from "../Models/Courses.js";
import { requireAuth, requireRole } from "../middleware/auth.js"; // Your middleware

const router = express.Router();

// --- 1. ALLOW BOTH HOD & ADMIN ---
// This middleware now allows users with the role "HOD" OR "ADMIN"
router.use(requireAuth, requireRole("HOD", "ADMIN"));

// --- 2. "SMART" GET (Read) ROUTE ---
router.get("/", async (req, res) => {
  try {
    const user = req.user; // { role, department, ... }
    let query = {};

    // --- This is the key logic ---
    // If the user is a HOD, filter by their department.
    // If they are ADMIN, the query stays empty {} and finds ALL courses.
    if (user.role === "HOD") {
      query.department = user.department;
    }

    const courses = await Course.find(query);
    res.json(courses);

  } catch (err) {
    res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
});

// --- 3. "SMART" PUT (Update) ROUTE ---
router.put("/:id", async (req, res) => {
  try {
    const user = req.user;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // --- Security Check ---
    // If the user is a HOD, they can only edit their own department's courses.
    // If they are ADMIN, this check is skipped, and they can edit anything.
    if (user.role === "HOD" && course.department !== user.department) {
      return res.status(403).json({ message: "Forbidden: You cannot edit this course." });
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, { new: true });
    res.json(updatedCourse);

  } catch (err) {
    res.status(500).json({ message: "Error updating course", error: err.message });
  }
});

// --- 4. "SMART" POST (Create) ROUTE ---
router.post("/", async (req, res) => {
  try {
    const user = req.user;
    
    // If the user is a HOD, enforce that they can only create courses for their department
    if (user.role === "HOD") {
      req.body.department = user.department;
    }

    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);

  } catch (err) {
    res.status(500).json({ message: "Error creating course", error: err.message });
  }
});

// --- 5. "SMART" DELETE ROUTE ---
router.delete("/:id", async (req, res) => {
  try {
    const user = req.user;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // --- Security Check ---
    // If the user is a HOD, they can only delete their own department's courses.
    // If they are ADMIN, this check is skipped, and they can delete anything.
    if (user.role === "HOD" && course.department !== user.department) {
      return res.status(403).json({ message: "Forbidden: You cannot delete this course." });
    }

    await Course.findByIdAndDelete(courseId);
    res.json({ message: "Course deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting course", error: err.message });
  }
});

export default router;