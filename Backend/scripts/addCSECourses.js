import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js";

dotenv.config();

const cseCourses = [
  // Semester 1
  { CCODE: "PH111", courseName: "Classical Physics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "CSE" },
  { CCODE: "MT111", courseName: "Calculus and Ordinary Differential Equations", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "CSE" },
  { CCODE: "EC111", courseName: "Basic Electronics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "CSE" },
  { CCODE: "EC111L", courseName: "Basic Electronics Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 1, department: "CSE" },
  { CCODE: "CS111", courseName: "Programming for Problem Solving", type: "Core", L: 3, T: 0, P: 3, credits: 4.5, semester: 1, department: "CSE" },
  { CCODE: "HS111", courseName: "Technical Communication in English", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 1, department: "CSE" },
  { CCODE: "HS112", courseName: "Indian Knowledge System", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 1, department: "CSE" },
  
  // Semester 2
  { CCODE: "HS121", courseName: "Human Values and Ethics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "CSE" },
  { CCODE: "ME121", courseName: "Environmental Science", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 2, department: "CSE" },
  { CCODE: "MT121", courseName: "Linear Algebra and Complex Analysis", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 2, department: "CSE" },
  { CCODE: "CS121", courseName: "Data Structures and Algorithms", type: "Core", L: 3, T: 0, P: 3, credits: 4.5, semester: 2, department: "CSE" },
  { CCODE: "PH121L", courseName: "UG Physics Laboratory", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 2, department: "CSE" },
  { CCODE: "CS122", courseName: "Introduction to Scripting Languages", type: "Core", L: 0, T: 0, P: 2, credits: 1, semester: 2, department: "CSE" },
  { CCODE: "CS123", courseName: "Digital Systems", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 2, department: "CSE" },
  { CCODE: "CS124", courseName: "Discrete Mathematics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "CSE" },
  
  // Semester 3
  { CCODE: "MT211", courseName: "Probability and Statistics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 3, department: "CSE" },
  { CCODE: "EC211", courseName: "Signals and Systems", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 3, department: "CSE" },
  { CCODE: "CS211", courseName: "Computer Organization and Architecture", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 3, department: "CSE" },
  { CCODE: "CS213", courseName: "Database Management Systems", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 3, department: "CSE" },
  { CCODE: "CS214", courseName: "Object Oriented Programming", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 3, department: "CSE" },
  { CCODE: "CS215", courseName: "Design and Analysis of Algorithms", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 3, department: "CSE" },
  
  // Semester 4
  { CCODE: "HS221", courseName: "Constitutional Studies", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 4, department: "CSE" },
  { CCODE: "HS222", courseName: "Principles of Management", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "CSE" },
  { CCODE: "CS221", courseName: "Web Programming", type: "Lab", L: 0, T: 0, P: 2, credits: 1, semester: 4, department: "CSE" },
  { CCODE: "CS222", courseName: "Theory of Computation", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "CSE" },
  { CCODE: "CS223", courseName: "Operating Systems", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 4, department: "CSE" },
  { CCODE: "CS224", courseName: "Computer Networks", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 4, department: "CSE" },
  { CCODE: "CS225", courseName: "Data Science", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "CSE" },
  { CCODE: "PE-S4-1", courseName: "Program Elective 1", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "CSE" },
  
  // Semester 5
  { CCODE: "LN311/LN312", courseName: "Summer Internship/Project", type: "Project", L: 0, T: 0, P: 8, credits: 4, semester: 5, department: "CSE" },
  { CCODE: "HS311", courseName: "Psychology, Technology & Society", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 5, department: "CSE" },
  { CCODE: "CS311", courseName: "Software Engineering", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 5, department: "CSE" },
  { CCODE: "CS312", courseName: "Artificial Intelligence", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 5, department: "CSE" },
  { CCODE: "CS313", courseName: "Computer System Security", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 5, department: "CSE" },
  { CCODE: "CS314", courseName: "Software Development Lab", type: "Lab", L: 0, T: 0, P: 2, credits: 1, semester: 5, department: "CSE" },
  { CCODE: "PE-S5-2", courseName: "Program Elective 2", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 5, department: "CSE" },

  // Semester 6
  { CCODE: "LN321", courseName: "B.Tech. Project (BTP)", type: "Project", L: 0, T: 0, P: 8, credits: 4, semester: 6, department: "CSE" },
  { CCODE: "HS321", courseName: "Introduction to Economics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "CSE" },
  { CCODE: "LN322", courseName: "Seminar and Presentation Skills", type: "Project", L: 0, T: 0, P: 2, credits: 1, semester: 6, department: "CSE" },
  { CCODE: "MT321", courseName: "Numerical Analysis and Scientific Computing", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 6, department: "CSE" },
  { CCODE: "PE-S6-3", courseName: "Program Elective 3", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "CSE" },
  { CCODE: "PE-S6-4", courseName: "Program Elective 4", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "CSE" },
  { CCODE: "OE-S6-1", courseName: "Open Elective 1", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "CSE" },
  
  // Semester 7
  { CCODE: "LN411", courseName: "B.Tech. Project (BTP)", type: "Project", L: 0, T: 0, P: 8, credits: 4, semester: 7, department: "CSE" },
  { CCODE: "PE-S7-5", courseName: "Program Elective 5", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "CSE" },
  { CCODE: "PE-S7-6", courseName: "Program Elective 6", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "CSE" },
  { CCODE: "OE-S7-2", courseName: "Open Elective 2", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "CSE" },
  { CCODE: "OE-S7-3", courseName: "Open Elective 3", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "CSE" },
  
  // Semester 8 - Options
  // Option 1
  { CCODE: "LN421", courseName: "Industrial SLI", type: "Project", L: 0, T: 0, P: 24, credits: 12, semester: 8, department: "CSE" },
  // Option 2
  { CCODE: "LN422", courseName: "Thesis", type: "Project", L: 0, T: 0, P: 24, credits: 12, semester: 8, department: "CSE" },
  // Option 3
  // Changed "OE/PE" to "Elective" and combined credits into L value
  { CCODE: "OE/PE-S8-3", courseName: "4 Elective Courses (Option 3)", type: "Elective", L: 12, T: 0, P: 0, credits: 12, semester: 8, department: "CSE" }, 
  // Option 4
  { CCODE: "LN423", courseName: "Project (Option 4)", type: "Project", L: 0, T: 0, P: 12, credits: 6, semester: 8, department: "CSE" },
  { CCODE: "OE/PE-S8-4", courseName: "2 Elective Courses (Option 4)", type: "Elective", L: 6, T: 0, P: 0, credits: 6, semester: 8, department: "CSE" }, 
  // Option 5
  { CCODE: "LN424", courseName: "Internship (Option 5)", type: "Project", L: 0, T: 0, P: 12, credits: 6, semester: 8, department: "CSE" },
  { CCODE: "OE/PE-S8-5", courseName: "2 Elective Courses (Option 5)", type: "Elective", L: 6, T: 0, P: 0, credits: 6, semester: 8, department: "CSE" }, 
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    // Ensure you have a 'Course' model defined that supports the schema.
    await Course.deleteMany({ department: "CSE" });
    console.log("🗑️ Deleted existing CSE courses");
    await Course.insertMany(cseCourses);
    console.log(`✅ Successfully added ${cseCourses.length} CSE courses!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });