import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js"; 

dotenv.config();

const hsCourses = [
  // Semester 1
  { 
    CCODE: "HS111", 
    courseName: "Technical Communication in English", 
    type: "Core", 
    L: 2, 
    T: 0, 
    P: 2, 
    credits: 3, 
    semester: 1, 
    department: "HSC" // Humanities & Social Sciences department code
  },
  { 
    CCODE: "HS112", 
    courseName: "Indian Knowledge System", 
    type: "Core", 
    L: 1, 
    T: 0, 
    P: 0, 
    credits: 1, 
    semester: 1, 
    department: "HSC" 
  },
  
  // Semester 2
  { 
    CCODE: "HS121", 
    courseName: "Human Values and Ethics", 
    type: "Core", 
    L: 3, 
    T: 0, 
    P: 0, 
    credits: 3, 
    semester: 2, 
    department: "HSC" 
  },
  
  // Semester 4
  { 
    CCODE: "HS221", 
    courseName: "Constitutional Studies", 
    type: "Core", 
    L: 1, 
    T: 0, 
    P: 0, 
    credits: 1, 
    semester: 4, 
    department: "HSC" 
  },
  { 
    CCODE: "HS222", 
    courseName: "Principles of Management", 
    type: "Core", 
    L: 3, 
    T: 0, 
    P: 0, 
    credits: 3, 
    semester: 4, 
    department: "HSC" 
  }, // Note: This course is only in the CSE curriculum
  
  // Semester 5
  { 
    CCODE: "HS311", 
    courseName: "Psychology, Technology & Society", 
    type: "Core", 
    L: 3, 
    T: 0, 
    P: 0, 
    credits: 3, 
    semester: 5, 
    department: "HSC" 
  },
  
  // Semester 6
  { 
    CCODE: "HS321", 
    courseName: "Introduction to Economics", 
    type: "Core", 
    L: 3, 
    T: 0, 
    P: 0, 
    credits: 3, 
    semester: 6, 
    department: "HSC" 
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    // 🗑️ Delete only existing HS courses
    await Course.deleteMany({ department: "HSC" }); 
    console.log("🗑️ Deleted existing HS courses");
    
    // 💾 Insert the new HS courses
    await Course.insertMany(hsCourses);
    console.log(`✅ Successfully added ${hsCourses.length} HS courses!`);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });