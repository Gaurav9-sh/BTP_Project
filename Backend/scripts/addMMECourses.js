// seed_me.js
// Source: Y23_BTech_ME.pdf :contentReference[oaicite:0]{index=0}
import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js";

dotenv.config();

const meCourses = [
  // -------- Semester 1 --------
  { CCODE: "PH111", courseName: "Classical Physics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "MME" }, // :contentReference[oaicite:1]{index=1}
  { CCODE: "MT111", courseName: "Calculus and Ordinary Differential Equations", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "MME" }, // :contentReference[oaicite:2]{index=2}
  { CCODE: "EC111", courseName: "Basic Electronics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 1, department: "MME" }, // :contentReference[oaicite:3]{index=3}
  { CCODE: "EC111L", courseName: "Basic Electronics Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 1, department: "MME" }, // :contentReference[oaicite:4]{index=4}
  { CCODE: "CS111", courseName: "Programming for Problem Solving", type: "Core", L: 3, T: 0, P: 3, credits: 4.5, semester: 1, department: "MME" }, // :contentReference[oaicite:5]{index=5}
  { CCODE: "HS111", courseName: "Technical Communication in English", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 1, department: "MME" }, // :contentReference[oaicite:6]{index=6}
  { CCODE: "HS112", courseName: "Indian Knowledge System", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 1, department: "MME" }, // :contentReference[oaicite:7]{index=7}

  // -------- Semester 2 --------
  { CCODE: "HS121", courseName: "Human Values and Ethics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "MME" }, // :contentReference[oaicite:8]{index=8}
  { CCODE: "ME121", courseName: "Environmental Science", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 2, department: "MME" }, // :contentReference[oaicite:9]{index=9}
  { CCODE: "MT121", courseName: "Linear Algebra and Complex Analysis", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 2, department: "MME" }, // :contentReference[oaicite:10]{index=10}
  { CCODE: "CS121", courseName: "Data Structures and Algorithms", type: "Core", L: 3, T: 0, P: 3, credits: 4.5, semester: 2, department: "MME" }, // :contentReference[oaicite:11]{index=11}
  { CCODE: "PH121L", courseName: "UG Physics Lab", type: "Lab", L: 0, T: 0, P: 3, credits: 1.5, semester: 2, department: "MME" }, // :contentReference[oaicite:12]{index=12}
  { CCODE: "CS122", courseName: "Introduction to Scripting Languages", type: "Core", L: 0, T: 0, P: 2, credits: 1, semester: 2, department: "MME" }, // :contentReference[oaicite:13]{index=13}
  { CCODE: "ME122", courseName: "Introduction to Mechanical Engineering", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 2, department: "MME" }, // :contentReference[oaicite:14]{index=14}
  { CCODE: "ME123", courseName: "Engineering Drawing and Graphics", type: "Core", L: 0, T: 0, P: 3, credits: 1.5, semester: 2, department: "MME" }, // :contentReference[oaicite:15]{index=15}
  { CCODE: "ME124", courseName: "Workshop Practices", type: "Core", L: 0, T: 0, P: 3, credits: 1.5, semester: 2, department: "MME" }, // :contentReference[oaicite:16]{index=16}
  { CCODE: "ME125", courseName: "Engineering Physical Metallurgy", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 2, department: "MME" }, // :contentReference[oaicite:17]{index=17}

  // -------- Semester 3 --------
  { CCODE: "MT211", courseName: "Probability and Statistics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 3, department: "MME" }, // :contentReference[oaicite:18]{index=18}
  { CCODE: "ME211", courseName: "Mechanics of Solids", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 3, department: "MME" }, // :contentReference[oaicite:19]{index=19}
  { CCODE: "ME212", courseName: "Rigid Body Dynamics", type: "Core", L: 2, T: 0, P: 0, credits: 2, semester: 3, department: "MME" }, // :contentReference[oaicite:20]{index=20}
  { CCODE: "ME213", courseName: "Engineering Thermodynamics", type: "Core", L: 3, T: 1, P: 0, credits: 4, semester: 3, department: "MME" }, // :contentReference[oaicite:21]{index=21}
  { CCODE: "ME214", courseName: "Welding and Casting", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 3, department: "MME" }, // :contentReference[oaicite:22]{index=22}
  { CCODE: "ME215", courseName: "Electrical Technology", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 3, department: "MME" }, // :contentReference[oaicite:23]{index=23}

  // -------- Semester 4 --------
  { CCODE: "HS221", courseName: "Constitutional Studies", type: "Core", L: 1, T: 0, P: 0, credits: 1, semester: 4, department: "MME" }, // :contentReference[oaicite:24]{index=24}
  { CCODE: "ME221", courseName: "Design of Machine Elements", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 4, department: "MME" }, // :contentReference[oaicite:25]{index=25}
  { CCODE: "ME222", courseName: "Fluid Mechanics and Machinery", type: "Core", L: 3, T: 1, P: 2, credits: 5, semester: 4, department: "MME" }, // :contentReference[oaicite:26]{index=26}
  { CCODE: "ME223", courseName: "Machining and Metal Forming", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 4, department: "MME" }, // :contentReference[oaicite:27]{index=27}
  { CCODE: "ME224", courseName: "Mechanisms and Machines", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 4, department: "MME" }, // :contentReference[oaicite:28]{index=28}
  { CCODE: "ME225", courseName: "Introduction to Computational Methods", type: "Core", L: 0, T: 0, P: 2, credits: 1, semester: 4, department: "MME" }, // :contentReference[oaicite:29]{index=29}
  { CCODE: "ME226", courseName: "Industrial Measurements", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 4, department: "MME" }, // :contentReference[oaicite:30]{index=30}

  // -------- Semester 5 --------
  { CCODE: "LN311/LN312", courseName: "Summer Internship/Project", type: "Other", L: 0, T: 0, P: 8, credits: 4, semester: 5, department: "MME" }, // :contentReference[oaicite:31]{index=31}
  { CCODE: "ME311", courseName: "Heat Transfer", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 5, department: "MME" }, // :contentReference[oaicite:32]{index=32}
  { CCODE: "ME312", courseName: "Design of Transmission Elements", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 5, department: "MME" }, // :contentReference[oaicite:33]{index=33}
  { CCODE: "ME313", courseName: "Digital Manufacturing", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 5, department: "MME" }, // :contentReference[oaicite:34]{index=34}
  { CCODE: "ME314", courseName: "Robotics and Control", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 5, department: "MME" }, // :contentReference[oaicite:35]{index=35}
  { CCODE: "ME315", courseName: "Mechatronics & IoT", type: "Core", L: 2, T: 0, P: 2, credits: 3, semester: 5, department: "MME" }, // :contentReference[oaicite:36]{index=36}

  // -------- Semester 6 --------
  { CCODE: "LN321", courseName: "B.Tech. Project (BTP)", type: "Other", L: 0, T: 0, P: 8, credits: 4, semester: 6, department: "MME" }, // :contentReference[oaicite:37]{index=37}
  { CCODE: "HS321", courseName: "Introduction to Economics", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "MME" }, // :contentReference[oaicite:38]{index=38}
  { CCODE: "LN322", courseName: "Seminar and Presentation Skills", type: "Other", L: 0, T: 0, P: 2, credits: 1, semester: 6, department: "MME" }, // :contentReference[oaicite:39]{index=39}
  { CCODE: "ME321", courseName: "IC Engines", type: "Core", L: 3, T: 0, P: 2, credits: 4, semester: 6, department: "MME" }, // :contentReference[oaicite:40]{index=40}
  { CCODE: "ME322", courseName: "Finite Element Methods", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "MME" }, // :contentReference[oaicite:41]{index=41}
  { CCODE: "ME323", courseName: "Industrial Engineering and Management", type: "Core", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "MME" }, // :contentReference[oaicite:42]{index=42}
  { CCODE: "PE-1", courseName: "Program Elective 1", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 6, department: "MME" }, // :contentReference[oaicite:43]{index=43}

  // -------- Semester 7 --------
  { CCODE: "LN411", courseName: "B.Tech. Project (BTP)", type: "Other", L: 0, T: 0, P: 8, credits: 4, semester: 7, department: "MME" }, // :contentReference[oaicite:44]{index=44}
  { CCODE: "OE-1", courseName: "Open Elective 1", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "MME" }, // :contentReference[oaicite:45]{index=45}
  { CCODE: "PE-2", courseName: "Program Elective 2", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "MME" }, // :contentReference[oaicite:46]{index=46}
  { CCODE: "PE-3", courseName: "Program Elective 3", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "MME" }, // :contentReference[oaicite:47]{index=47}
  { CCODE: "PE-4", courseName: "Program Elective 4", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "MME" }, // :contentReference[oaicite:48]{index=48}
  { CCODE: "OE-2", courseName: "Open Elective 2", type: "Elective", L: 3, T: 0, P: 0, credits: 3, semester: 7, department: "MME" }, // :contentReference[oaicite:49]{index=49}

  // -------- Semester 8 (options) --------
  { CCODE: "LN421", courseName: "Industrial SLI", type: "Other", L: 0, T: 0, P: 24, credits: 12, semester: 8, department: "MME" }, // :contentReference[oaicite:50]{index=50}
  { CCODE: "LN422", courseName: "Thesis", type: "Other", L: 0, T: 0, P: 24, credits: 12, semester: 8, department: "MME" }, // :contentReference[oaicite:51]{index=51}
  { CCODE: "LN423", courseName: "Project", type: "Other", L: 0, T: 0, P: 12, credits: 6, semester: 8, department: "MME" }, // :contentReference[oaicite:52]{index=52}
  { CCODE: "LN424", courseName: "Internship", type: "Other", L: 0, T: 0, P: 12, credits: 6, semester: 8, department: "MME" }, // :contentReference[oaicite:53]{index=53}
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await Course.deleteMany({ department: "MME" });
    console.log("🗑️  Deleted existing MEE courses");
    await Course.insertMany(meCourses);
    console.log(`✅ Successfully added ${meCourses.length} MEE courses!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
