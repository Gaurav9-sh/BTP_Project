// Models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
{
  CCODE: {
    type: String,
    required: true,
    trim: true,
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["Core", "Elective", "Lab", "Project", "Other"],
    required: true,
  },
  L: { type: Number, required: true, min: 0 },
  T: { type: Number, required: true, min: 0 },
  P: { type: Number, required: true, min: 0 },
  credits: { type: Number, required: true, min: 0 },

  department: {
    type: String,
    required: true,
    trim: true,
    // This ensures each course is owned by one dept — used for HOD validation.
  },

  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },

  // ✅ HOD workflow fields
  hodStatus: {
    type: String,
    enum: ["pending", "approved", "changes"],
    default: "pending",
  },

  hodComment: { type: String, default: "" },

  hodBy: { type: String, default: "" }, // HOD email who last acted
  hodAt: { type: Date },

  isLocked: { type: Boolean, default: false }, // After HOD approves
},
{
  timestamps: true,
  collection: "Courses"
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
