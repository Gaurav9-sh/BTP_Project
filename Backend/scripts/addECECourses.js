import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js";

dotenv.config();

const eceCourses = [
  // Semester 1
  { CCODE: "PH111", courseName: "Classical Physics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "ECE" },
  { CCODE: "MT111", courseName: "Calculus and Ordinary Differential Equations", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "ECE" },
  { CCODE: "EC111", courseName: "Basic Electronics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "ECE" },
  { CCODE: "EC111L", courseName: "Basic Electronics Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 1, department: "ECE" },
  { CCODE: "CS111", courseName: "Programming for Problem Solving", type: "Core", L: 3, T: 0, P: 3, credits: 4.5, semester: 1, department: "ECE" },
  { CCODE: "HS111", courseName: "Technical Communication in English", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 1, department: "ECE" },
  { CCODE: "HS112", courseName: "Indian Knowledge System", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 1, department: "ECE" },
  // Semester 2
  { CCODE: "HS121", courseName: "Human Values and Ethics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "ECE" },
  { CCODE: "ME121", courseName: "Environmental Science", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 2, department: "ECE" },
  { CCODE: "MT121", courseName: "Linear Algebra and Complex Analysis", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 2, department: "ECE" },
  { CCODE: "CS121", courseName: "Data Structures and Algorithms", type: "Core", L: 3, T: 0, P: 3, credits: 4.5, semester: 2, department: "ECE" },
  { CCODE: "PH121L", courseName: "UG Physics Laboratory", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 2, department: "ECE" },
  { CCODE: "CS122", courseName: "Introduction to Scripting Languages", type: "Core", L: 0, T: 0, P: 2, credits: 1, semester: 2, department: "ECE" },
  { CCODE: "EC121", courseName: "Semiconductor Devices and Circuits", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "ECE" },
  { CCODE: "EC122", courseName: "Analog Electronics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "ECE" },
  { CCODE: "EC122L", courseName: "Analog Electronics Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 2, department: "ECE" },
  // Semester 3
  { CCODE: "MT211", courseName: "Probability and Statistics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 3, department: "ECE" },
  { CCODE: "EC211", courseName: "Signals and Systems", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 3, department: "ECE" },
  { CCODE: "EC211L", courseName: "Signals and Systems Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 3, department: "ECE" },
  { CCODE: "EC213", courseName: "Digital Circuit and Systems", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 3, department: "ECE" },
  { CCODE: "EC213L", courseName: "Digital Circuit and Systems Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 3, department: "ECE" },
  { CCODE: "EC214", courseName: "Engineering Electromagnetics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 3, department: "ECE" },
  { CCODE: "EC215", courseName: "Microprocessor and Microcontroller", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 3, department: "ECE" },
  { CCODE: "EC215L", courseName: "Microprocessor and Microcontroller Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 3, department: "ECE" },
  { CCODE: "EC216", courseName: "Network Analysis and Synthesis", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 3, department: "ECE" },
  // Semester 4
  { CCODE: "HS221", courseName: "Constitutional Studies", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 4, department: "ECE" },
  { CCODE: "EC221", courseName: "Analog and Digital Communication", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "ECE" },
  { CCODE: "EC221L", courseName: "Analog and Digital Communication Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 4, department: "ECE" },
  { CCODE: "EC222", courseName: "Fundamentals of VLSI", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "ECE" },
  { CCODE: "EC222L", courseName: "VLSI Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 4, department: "ECE" },
  { CCODE: "EC223", courseName: "Microwave Engineering", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "ECE" },
  { CCODE: "EC223L", courseName: "Microwave Engineering Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 4, department: "ECE" },
  { CCODE: "EC224L", courseName: "Design and Project Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 4, department: "ECE" },
  { CCODE: "CC321", courseName: "Introduction to AI and ML", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 4, department: "ECE" },
  // Semester 5
  { CCODE: "LN311", courseName: "Summer Internship/Project", type: "Other", L: 0, T: 0, P: 8, credits: 4, semester: 5, department: "ECE" },
  { CCODE: "HS311", courseName: "Psychology, Technology & Society", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 5, department: "ECE" },
  { CCODE: "EC311", courseName: "Wireless Communication", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 5, department: "ECE" },
  { CCODE: "EC311L", courseName: "Wireless Communication lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 5, department: "ECE" },
  { CCODE: "EC312", courseName: "Control System Engineering", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 5, department: "ECE" },
  { CCODE: "EC313", courseName: "Digital Signal Processing", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 5, department: "ECE" },
  { CCODE: "EC313L", courseName: "Digital Signal Processing Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 5, department: "ECE" },
  // Semester 6
  { CCODE: "LN321", courseName: "B.Tech. Project (BTP)", type: "Other", L: 0, T: 0, P: 8, credits: 4, semester: 6, department: "ECE" },
  { CCODE: "HS321", courseName: "Introduction to Economics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "ECE" },
  { CCODE: "LN322", courseName: "Seminar and Presentation Skills", type: "Other", L: 0, T: 0, P: 2, credits: 1, semester: 6, department: "ECE" },
  { CCODE: "EC321", courseName: "5G Wireless Systems and beyond", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "ECE" },
  { CCODE: "CC221", courseName: "Computer Communication Networks", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 6, department: "ECE" },
  // Semester 7
  { CCODE: "LN411", courseName: "B.Tech. Project (BTP)", type: "Other", L: 0, T: 0, P: 8, credits: 4, semester: 7, department: "ECE" },
  // Semester 8
  { CCODE: "LN421", courseName: "Industrial SLI", type: "Other", L: 0, T: 0, P: 24, credits: 12, semester: 8, department: "ECE" },
  { CCODE: "LN422", courseName: "Thesis", type: "Other", L: 0, T: 0, P: 24, credits: 12, semester: 8, department: "ECE" },
  { CCODE: "LN423", courseName: "Project", type: "Other", L: 0, T: 0, P: 12, credits: 6, semester: 8, department: "ECE" },
  { CCODE: "LN424", courseName: "Internship", type: "Other", L: 0, T: 0, P: 12, credits: 6, semester: 8, department: "ECE" },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await Course.deleteMany({ department: "ECE" });
    console.log("🗑️  Deleted existing ECE courses");
    await Course.insertMany(eceCourses);
    console.log(`✅ Successfully added ${eceCourses.length} ECE courses!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });