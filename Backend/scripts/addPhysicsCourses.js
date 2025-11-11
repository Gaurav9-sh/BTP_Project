import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js"; 

dotenv.config();

const physicsCourses = [
  // Semester 1
  { 
    CCODE: "PH111", 
    courseName: "Classical Physics", 
    type: "Core", // Mapped from 'BSC'
    L: 3, 
    T: 1, 
    P: 0, 
    credits: 4, 
    semester: 1, 
    department: "PHY" 
  },
  
  // Semester 2
  { 
    CCODE: "PH121L", 
    courseName: "UG Physics Laboratory", 
    type: "Lab", // Mapped from 'BSC' (as it's a lab component)
    L: 0, 
    T: 0, 
    P: 3, 
    credits: 1.5, 
    semester: 2, 
    department: "PHY" 
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    // 🗑️ Delete only existing Physics courses
    await Course.deleteMany({ department: "PHY" }); 
    console.log("🗑️ Deleted existing Physics courses");
    
    // 💾 Insert the new Physics courses
    await Course.insertMany(physicsCourses);
    console.log(`✅ Successfully added ${physicsCourses.length} Physics courses!`);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });