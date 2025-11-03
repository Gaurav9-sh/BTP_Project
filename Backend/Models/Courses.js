// models/course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  CCODE: {
    type: String,
    required: true,
    unique: true, // Each course code should be unique
    trim: true,
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["Core", "Elective", "Lab", "Other"], // Optional constraint
    required: true,
  },
  L: {
    type: Number,
    required: true,
    min: 0,
  },
  T: {
    type: Number,
    required: true,
    min: 0,
  },
  P: {
    type: Number,
    required: true,
    min: 0,
  },
  credits: {
    type: Number,
    required: true,
    min: 0,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8, // Assuming 8 semesters in a typical degree
  },
}, {
  timestamps: true, // Adds createdAt & updatedAt fields
  collection: "Courses"
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
