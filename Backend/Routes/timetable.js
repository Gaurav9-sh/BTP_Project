import express from "express";
import Course from "../Models/Courses.js";
import User from "../Models/User.js";
import { Batch, Room, Slot } from "../Models/Configuration.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const router = express.Router();
const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to convert array of objects to CSV string
function arrayToCSV(data, headers) {
  if (data.length === 0) return headers.join(",");
  const rows = [headers.join(",")];
  data.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header.toLowerCase().replace(/ /g, "_")];
      return val !== undefined && val !== null ? val : "";
    });
    rows.push(values.join(","));
  });
  return rows.join("\n");
}

// Generate teachers CSV data
function generateTeachersData(facultyMap, faculties) {
  const teachersData = [];
  
  for (const faculty of faculties) {
    const employeeId = faculty.employeeId || faculty.email.split('@')[0];
    facultyMap.set(faculty.email, employeeId);
    
    const unavailableSlots = faculty.unavailableSlots && faculty.unavailableSlots.length > 0
      ? faculty.unavailableSlots.join(';')
      : "";
    
    const maxHours = faculty.maxHoursPerDay || 8; // Default to 8
    
    teachersData.push({
      teacher_id: employeeId,
      name: faculty.name,
      unavailable_slots: unavailableSlots,
      max_hours_per_day: maxHours
    });
  }
  
  return teachersData;
}

// Generate courses CSV data
function generateCoursesData(courses, facultyMap, batchMap) {
  const coursesData = [];
  
  for (const course of courses) {
    const hoursPerWeek = course.L + course.T + course.P;
    
    if (hoursPerWeek === 0) {
      console.log(`⚠️  Skipping ${course.CCODE} - has 0 hours per week (L:${course.L}, T:${course.T}, P:${course.P})`);
      continue;
    }
    
    // Get faculty assignment
    const facultyAssignment = course.facultyAssignments && course.facultyAssignments.length > 0
      ? course.facultyAssignments[0]
      : null;
    
    const teacherId = facultyAssignment && facultyMap.has(facultyAssignment.facultyEmail)
      ? facultyMap.get(facultyAssignment.facultyEmail)
      : "";
    
    if (!teacherId) {
      console.log(`⚠️  Skipping ${course.CCODE} - no valid teacher ID found for email: ${facultyAssignment?.facultyEmail}`);
      continue;
    }
    
    // Get batch assignment (studentBatches is array of strings, not objects!)
    const batchName = course.studentBatches && course.studentBatches.length > 0
      ? course.studentBatches[0]  // ← This is a STRING like "CSE-Y23"
      : null;
    
    const batchInfo = batchName && batchMap.has(batchName)
      ? batchMap.get(batchName)
      : null;
    
    if (!batchInfo) {
      console.log(`⚠️  Skipping ${course.CCODE} - batch "${batchName}" not found in batch collection`);
      continue;
    }
    
    coursesData.push({
      course_id: course.CCODE,
      title: course.courseName,  // ← FIX: use courseName not CNAME
      hours_per_week: hoursPerWeek,
      teacher_id: teacherId,
      batch_id: batchInfo.id,  // ← Use the batchId from batchInfo
      requires_lab: "False"
    });
  }
  
  return coursesData;
}

// Generate batches CSV data
function generateBatchesData(batchMap) {
  const batchesData = [];
  
  for (const [batchId, batchInfo] of batchMap.entries()) {
    const size = batchInfo.size && !isNaN(batchInfo.size) && batchInfo.size > 0 
      ? batchInfo.size 
      : 30; // Default to 30
    
    // Extract programme from batchId (e.g., "CSE-Y23" -> "CSE Y23")
    const programme = batchId.replace('-', ' ');
    
    batchesData.push({
      batch_id: batchId,
      programme: programme,  // ← C++ solver expects 3 columns!
      size: size
    });
  }
  
  return batchesData;
}

// Generate rooms CSV data
function generateRoomsData(rooms) {
  const roomsData = [];
  
  for (const room of rooms) {
    const capacity = room.capacity && !isNaN(room.capacity) && room.capacity > 0
      ? room.capacity
      : 50; // Default to 50
    
    const isLab = room.isLab ? "true" : "false";  // ← C++ expects boolean string
    
    roomsData.push({
      room_id: room.roomId,
      capacity: capacity,
      is_lab: isLab  // ← C++ solver expects 3 columns!
    });
  }
  
  return roomsData;
}

// Generate slots CSV data
function generateSlotsData(slots) {
  const slotsData = [];
  
  for (const slot of slots) {
    slotsData.push({
      slot_id: slot.slotId || `${slot.day}_${slot.startTime}`,
      day: slot.day,
      start_time: slot.startTime,
      end_time: slot.endTime
    });
  }
  
  return slotsData;
}

// Main timetable generation route
router.post("/generate", async (req, res) => {
  try {
    const { semesterFilter } = req.body;
    
    console.log("📅 Generating timetable for:", semesterFilter || "ALL");
    console.log("📊 Fetching data from database...");
    
    // Build course query with semester filter
    let courseQuery = {
      'facultyAssignments.0': { $exists: true },
      'studentBatches.0': { $exists: true }
    };
    
    if (semesterFilter === 'ODD') {
      courseQuery.semester = { $in: [1, 3, 5, 7] };
      console.log("   Filtering: ODD semesters (1, 3, 5, 7) with faculty & batches");
    } else if (semesterFilter === 'EVEN') {
      courseQuery.semester = { $in: [2, 4, 6, 8] };
      console.log("   Filtering: EVEN semesters (2, 4, 6, 8) with faculty & batches");
    } else if (semesterFilter && !isNaN(semesterFilter)) {
      const semNum = parseInt(semesterFilter);
      if (semNum >= 1 && semNum <= 8) {
        courseQuery.semester = semNum;
        console.log(`   Filtering: Semester ${semNum} with faculty & batches`);
      }
    } else {
      console.log("   Filtering: ALL semesters with faculty & batches");
    }
    
    // Fetch data
    const [courses, faculties, batches, rooms, slots] = await Promise.all([
      Course.find(courseQuery),
      User.find({ role: "FACULTY" }),
      Batch.find(),
      Room.find(),
      Slot.find()
    ]);
    
    console.log(`✅ Found ${courses.length} READY courses, ${faculties.length} faculties, ${batches.length} batches, ${rooms.length} rooms, ${slots.length} slots`);
    
    // Validate minimum requirements
    if (courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No courses found with both faculty and batch assignments for the selected semester(s)."
      });
    }
    
    if (batches.length === 0 || rooms.length === 0 || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required configuration: batches, rooms, or time slots."
      });
    }
    
    // Log courses being processed
    console.log(`\n📚 Processing ${courses.length} courses for timetable:`);
    courses.forEach((course, idx) => {
      const facultyEmails = course.facultyAssignments.map(fa => fa.facultyEmail).join(', ');
      const batchNames = course.studentBatches.join(', '); // ← FIX: studentBatches is array of strings
      console.log(`  ${idx + 1}. ${course.CCODE} (Sem ${course.semester}): ${course.courseName}`); // ← FIX: use courseName
      console.log(`     Faculty: ${facultyEmails}`);
      console.log(`     Batches: ${batchNames}`);
    });
    
    // Create batch map
    const batchMap = new Map();
    batches.forEach(batch => {
      batchMap.set(batch.batchId, {
        id: batch.batchId,
        size: batch.size || 30
      });
    });
    
    // Create faculty map
    const facultyMap = new Map();
    
    console.log("\n🔄 Transforming data...");
    
    // Check if all courses have faculty and batches
    const allCoursesReady = courses.every(course => 
      course.facultyAssignments && course.facultyAssignments.length > 0 &&
      course.studentBatches && course.studentBatches.length > 0
    );
    
    if (!allCoursesReady) {
      console.log("⚠️  WARNING: Some courses are missing faculty or batch assignments!");
    } else {
      console.log("✅ All courses have faculty and batches assigned!");
    }
    
    // Collect all unique faculty emails from courses
    const courseFacultyEmails = new Set();
    courses.forEach(course => {
      if (course.facultyAssignments && course.facultyAssignments.length > 0) {
        course.facultyAssignments.forEach(fa => {
          courseFacultyEmails.add(fa.facultyEmail);
        });
      }
    });
    
    console.log(`\n📧 Found ${courseFacultyEmails.size} unique faculty emails in courses`);
    
    // Create a merged faculty list: existing faculties + course faculty
    const facultyEmailsArray = Array.from(courseFacultyEmails);
    const mergedFaculties = [...faculties];
    
    // Add any course faculty that don't exist in User table
    facultyEmailsArray.forEach(email => {
      const exists = faculties.some(f => f.email === email);
      if (!exists) {
        // Create a temporary faculty object
        const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        mergedFaculties.push({
          email: email,
          name: name,
          employeeId: email.split('@')[0],
          maxHoursPerDay: 8,
          unavailableSlots: []
        });
        console.log(`  ➕ Added temporary faculty: ${name} (${email})`);
      }
    });
    
    // Generate CSV data
    const teachersData = generateTeachersData(facultyMap, mergedFaculties);
    const coursesData = generateCoursesData(courses, facultyMap, batchMap);
    const batchesData = generateBatchesData(batchMap);
    const roomsData = generateRoomsData(rooms);
    const slotsData = generateSlotsData(slots);
    
    // Create temporary directory
    console.log("📁 Creating temporary directory and writing CSV files...");
    const tempDir = path.join(__dirname, "..", "Scheduling Algorithm", "build", "temp_" + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write CSV files
    const teachersCSV = arrayToCSV(teachersData, ["teacher_id", "name", "unavailable_slots", "max_hours_per_day"]);
    const coursesCSV = arrayToCSV(coursesData, ["course_id", "title", "hours_per_week", "teacher_id", "batch_id", "requires_lab"]);
    const batchesCSV = arrayToCSV(batchesData, ["batch_id", "programme", "size"]);  // ← FIX: Add programme column
    const roomsCSV = arrayToCSV(roomsData, ["room_id", "capacity", "is_lab"]);  // ← FIX: Add is_lab column
    const slotsCSV = arrayToCSV(slotsData, ["slot_id", "day", "start_time", "end_time"]);
    
    await fs.writeFile(path.join(tempDir, "teachers.csv"), teachersCSV);
    console.log(`  ✓ Created teachers.csv (${teachersData.length} rows)`);
    console.log("\n📄 Sample of teachers.csv (first 5 rows):");
    console.log("   " + teachersCSV.split('\n').slice(0, 6).join('\n   '));
    
    await fs.writeFile(path.join(tempDir, "courses.csv"), coursesCSV);
    console.log(`  ✓ Created courses.csv (${coursesData.length} rows)`);
    console.log("\n📄 Sample of courses.csv (first 5 rows):");
    console.log("   " + coursesCSV.split('\n').slice(0, 6).join('\n   '));
    
    await fs.writeFile(path.join(tempDir, "batches.csv"), batchesCSV);
    console.log(`  ✓ Created batches.csv (${batchesData.length} rows)`);
    console.log("\n📄 Sample of batches.csv (first 5 rows):");
    console.log("   " + batchesCSV.split('\n').slice(0, 6).join('\n   '));
    
    await fs.writeFile(path.join(tempDir, "rooms.csv"), roomsCSV);
    console.log(`  ✓ Created rooms.csv (${roomsData.length} rows)`);
    console.log("\n📄 Sample of rooms.csv (first 5 rows):");
    console.log("   " + roomsCSV.split('\n').slice(0, 6).join('\n   '));
    
    await fs.writeFile(path.join(tempDir, "slots.csv"), slotsCSV);
    console.log(`  ✓ Created slots.csv (${slotsData.length} rows)`);
    console.log("\n📄 Sample of slots.csv (first 5 rows):");
    console.log("   " + slotsCSV.split('\n').slice(0, 6).join('\n   '));
    
    console.log("\n✅ All CSV files created successfully!");
    
    // Validate CSV data
    console.log("\n🔍 Validating CSV data:");
    console.log(`  • Courses entries: ${coursesData.length}`);
    console.log(`  • Teachers entries: ${teachersData.length}`);
    console.log(`  • Batches entries: ${batchesData.length}`);
    console.log(`  • Rooms entries: ${roomsData.length}`);
    console.log(`  • Slots entries: ${slotsData.length}`);
    
    if (coursesData.length === 0) {
      await fs.rm(tempDir, { recursive: true, force: true });
      return res.status(400).json({
        success: false,
        message: "No valid courses to schedule after validation. Ensure courses have valid faculty and batch assignments."
      });
    }
    
    // Copy solver executable and Python script
    console.log("\n📋 Copying solver and Python script...");
    const solverSourcePath = path.join(__dirname, "..", "Scheduling Algorithm", "build", "timetable_solver");
    const solverDestPath = path.join(tempDir, "timetable_solver");
    const pythonScriptPath = path.join(__dirname, "..", "Scheduling Algorithm", "build", "csv_to_pdf.py");
    const pythonDestPath = path.join(tempDir, "csv_to_pdf.py");
    
    await fs.copyFile(solverSourcePath, solverDestPath);
    await fs.chmod(solverDestPath, 0o755);
    await fs.copyFile(pythonScriptPath, pythonDestPath);
    
    // Run solver
    console.log("⚙️  Running timetable solver...");
    try {
      const { stdout, stderr } = await execPromise(`cd "${tempDir}" && ./timetable_solver`, {
        timeout: 60000 // 60 seconds timeout
      });
      
      if (stderr) {
        console.log("Solver stderr:", stderr);
      }
      if (stdout) {
        console.log("Solver stdout:", stdout);
      }
      
      // Check if schedule was generated
      const schedulePath = path.join(tempDir, "schedule.csv");
      try {
        await fs.access(schedulePath);
        console.log("✅ schedule.csv generated successfully");
        
        // Check if schedule is not empty
        const scheduleContent = await fs.readFile(schedulePath, 'utf-8');
        const scheduleLines = scheduleContent.split('\n').filter(line => line.trim());
        console.log(`📊 Schedule has ${scheduleLines.length - 1} entries (excluding header)`);
        
        if (scheduleLines.length <= 1) {
          console.log("⚠️  WARNING: Schedule is empty!");
          await fs.rm(tempDir, { recursive: true, force: true });
          return res.status(422).json({
            success: false,
            message: "Solver generated an empty schedule. No feasible solution found with current constraints."
          });
        }
        
        // Log first 10 entries
        console.log("\n📄 Sample schedule entries (first 10):");
        scheduleLines.slice(0, 11).forEach((line, idx) => {
          console.log(`   ${idx === 0 ? 'HEADER' : idx}: ${line}`);
        });
        
      } catch (err) {
        console.error("❌ schedule.csv not found");
        await fs.rm(tempDir, { recursive: true, force: true });
        return res.status(500).json({
          success: false,
          message: "Solver failed to generate schedule.csv"
        });
      }
      
    } catch (error) {
      console.error("Solver execution error:", error);
      await fs.rm(tempDir, { recursive: true, force: true });
      
      if (error.killed) {
        return res.status(408).json({
          success: false,
          message: "Timetable generation timed out. The problem may be too complex."
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Failed to run timetable solver: " + error.message
      });
    }
    
    // Generate PDF
    console.log("📄 Generating PDF...");
    try {
      await execPromise(`cd "${tempDir}" && python3 csv_to_pdf.py`, {
        timeout: 30000 // 30 seconds timeout
      });
      
      const pdfPath = path.join(tempDir, "output.pdf");
      await fs.access(pdfPath);
      console.log("✅ PDF generated successfully");
      
      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // Clean up temp directory
      console.log("🧹 Cleaning up temporary files...");
      await fs.rm(tempDir, { recursive: true, force: true });
      
      // Generate appropriate filename
      let filename = 'timetable_all_semesters.pdf';
      if (semesterFilter === 'ODD') {
        filename = 'timetable_odd_semesters.pdf';
      } else if (semesterFilter === 'EVEN') {
        filename = 'timetable_even_semesters.pdf';
      } else if (semesterFilter) {
        filename = `timetable_semester_${semesterFilter}.pdf`;
      }
      
      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
      
      console.log("✅ Timetable generation complete!\n");
      
    } catch (error) {
      console.error("PDF generation error:", error);
      if (error.stderr) {
        console.error("Python stderr:", error.stderr);
      }
      await fs.rm(tempDir, { recursive: true, force: true });
      
      let errorMessage = "Failed to generate PDF from schedule.";
      if (error.stderr && error.stderr.includes("No valid slot data")) {
        errorMessage = "Schedule contains invalid slot data. Please check time slot configuration.";
      } else if (error.stderr && error.stderr.includes("ValueError")) {
        errorMessage = "Error parsing schedule data. " + error.message;
      } else {
        errorMessage = "Failed to generate PDF from schedule. Error: " + error.message;
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
    
  } catch (error) {
    console.error("\n❌ Error generating timetable:");
    console.error("   Name:", error.name);
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
});

export default router;
