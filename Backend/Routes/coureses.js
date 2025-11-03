import express from "express";
import Course from "../Models/Courses.js";  

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    console.log("Hello from backend")
    const { department } = req.query; 

    let query = {};
    if (department) {
      query.department = department;
    }

    const courses = await Course.find(query);
    console.log("Courses from db:",courses)
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: "Error updating course", error: err.message });
  }
});

// ✅ Delete a course
router.delete("/:id", async (req, res) => {
  console.log("Hello")
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting course", error: err.message });
  }
});


export default router;
