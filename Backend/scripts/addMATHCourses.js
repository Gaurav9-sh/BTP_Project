import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js"; 

dotenv.config();

const mathCourses = [
  // Semester 1
  { 
    CCODE: "MT111", 
    courseName: "Calculus and Ordinary Differential Equations", 
    type: "Core", 
    L: 3, 
    T: 1, 
    P: 0, 
    credits: 4, 
    semester: 1, 
    department: "MAT" // Mathematics Department Code
  },
  
  // Semester 2
  { 
    CCODE: "MT121", 
    courseName: "Linear Algebra and Complex Analysis", 
    type: "Core", 
    L: 3, 
    T: 1, 
    P: 0, 
    credits: 4, 
    semester: 2, 
    department: "MAT" 
  },

  // Semester 3
  { 
    CCODE: "MT211", 
    courseName: "Probability and Statistics", 
    type: "Core", 
    L: 3, 
    T: 1, 
    P: 0, 
    credits: 4, 
    semester: 3, 
    department: "MAT" 
  },

  // Semester 6 (Found in CSE curriculum)
  { 
    CCODE: "MT321", 
    courseName: "Numerical Analysis and Scientific Computing", 
    type: "Core", 
    L: 3, 
    T: 1, 
    P: 0, 
    credits: 4, 
    semester: 6, 
    department: "MAT" 
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    // 🗑️ Delete only existing Mathematics courses
    await Course.deleteMany({ department: "MAT" }); 
    console.log("🗑️ Deleted existing Mathematics courses");
    
    // 💾 Insert the new Mathematics courses
    await Course.insertMany(mathCourses);
    console.log(`✅ Successfully added ${mathCourses.length} Mathematics courses!`);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });