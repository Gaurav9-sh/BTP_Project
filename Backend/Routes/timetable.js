// Backend/Routes/timetable.js
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { randomBytes } from "crypto";
import Course from "../Models/Courses.js";
import User from "../Models/User.js";
import { Batch, Room, Slot } from "../Models/Configuration.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const execPromise = promisify(exec);

// Utility function to create temporary directory
async function createTempDir() {
  const timestamp = Date.now();
  const random = randomBytes(4).toString('hex');
  const tempDirName = `timetable_${timestamp}_${random}`;
  const tempDir = path.join('/tmp', tempDirName);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

// Utility function to clean up temporary directory
async function cleanupTempDir(tempDir) {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to cleanup temp directory ${tempDir}:`, error);
  }
}

// Convert data to CSV format
function arrayToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape values containing commas or quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Generate courses.csv data
function generateCoursesData(courses, facultyMap, batchMap) {
  const coursesData = [];
  
  for (const course of courses) {
    // Calculate total hours per week
    const hoursPerWeek = course.L + course.T + course.P;
    
    // Determine if course requires lab
    const requiresLab = course.P > 0 || course.type === "Lab";
    
    // Get teacher ID from faculty email
    const facultyAssignment = course.facultyAssignments && course.facultyAssignments.length > 0
      ? course.facultyAssignments[0]
      : null;
    
    const teacherId = facultyAssignment && facultyMap.has(facultyAssignment.facultyEmail)
      ? facultyMap.get(facultyAssignment.facultyEmail)
      : "";
    
    // Handle batches
    if (course.studentBatches && course.studentBatches.length > 0) {
      if (course.sharingType === "Horizontal") {
        // Create separate entries for each batch
        for (const batchId of course.studentBatches) {
          coursesData.push({
            course_id: `${course.CCODE}_${batchId}`,
            title: course.courseName,
            hours_per_week: hoursPerWeek,
            teacher_id: teacherId,
            batch_id: batchId,
            requires_lab: requiresLab ? "True" : "False"
          });
        }
      } else {
        // Vertical sharing - create a combined batch
        const combinedBatchId = course.studentBatches.join('+');
        
        // Add combined batch to batchMap if not exists
        if (!batchMap.has(combinedBatchId)) {
          // Calculate combined size
          let combinedSize = 0;
          let programme = "";
          
          for (const batchId of course.studentBatches) {
            const batch = batchMap.get(batchId);
            if (batch) {
              combinedSize += batch.size;
              if (!programme) programme = batch.programme;
            }
          }
          
          batchMap.set(combinedBatchId, {
            batch_id: combinedBatchId,
            programme: programme,
            size: combinedSize
          });
        }
        
        coursesData.push({
          course_id: course.CCODE,
          title: course.courseName,
          hours_per_week: hoursPerWeek,
          teacher_id: teacherId,
          batch_id: combinedBatchId,
          requires_lab: requiresLab ? "True" : "False"
        });
      }
    } else {
      // No batches assigned - create entry anyway
      coursesData.push({
        course_id: course.CCODE,
        title: course.courseName,
        hours_per_week: hoursPerWeek,
        teacher_id: teacherId,
        batch_id: "",
        requires_lab: requiresLab ? "True" : "False"
      });
    }
  }
  
  return coursesData;
}

// Generate batches.csv data
function generateBatchesData(batchMap) {
  const batchesData = [];
  
  for (const [batchId, batch] of batchMap) {
    batchesData.push({
      batch_id: batchId,
      programme: batch.programme || "",
      size: batch.size || 0
    });
  }
  
  return batchesData;
}

// Generate rooms.csv data
function generateRoomsData(rooms) {
  return rooms.map(room => ({
    room_id: room.roomId,
    capacity: room.capacity,
    is_lab: room.isLab ? "True" : "False"
  }));
}

// Generate slots.csv data
function generateSlotsData(slots) {
  return slots.map(slot => ({
    slot_id: slot.slotId,
    day: slot.day,
    start: slot.startTime,
    end: slot.endTime
  }));
}

// Generate teachers.csv data
function generateTeachersData(facultyMap, faculties) {
  const teachersData = [];
  
  for (const faculty of faculties) {
    const employeeId = faculty.employeeId || faculty.email.split('@')[0]; // Fallback to email prefix
    facultyMap.set(faculty.email, employeeId);
    
    const unavailableSlots = faculty.unavailableSlots && faculty.unavailableSlots.length > 0
      ? faculty.unavailableSlots.join(';')
      : "";
    
    teachersData.push({
      teacher_id: employeeId,
      name: faculty.name,
      unavailable_slots: unavailableSlots,
      max_hours_per_day: faculty.maxHoursPerDay || 4
    });
  }
  
  return teachersData;
}

// POST /api/timetable/generate
router.post("/generate", requireAuth, async (req, res) => {
  let tempDir = null;
  
  try {
    const { semester } = req.body;
    
    // Validate semester if provided
    if (semester !== undefined && (semester < 1 || semester > 8)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid semester. Must be between 1 and 8." 
      });
    }
    
    console.log(`📅 Generating timetable${semester ? ` for semester ${semester}` : ' for all semesters'}...`);
    
    // Step 1: Fetch data from database
    console.log("📊 Fetching data from database...");
    
    const courseQuery = semester ? { semester } : {};
    const [courses, faculties, batches, rooms, slots] = await Promise.all([
      Course.find(courseQuery),
      User.find({ role: "FACULTY" }),
      Batch.find(),
      Room.find(),
      Slot.find()
    ]);
    
    // Validate data completeness
    if (courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No courses found${semester ? ` for semester ${semester}` : ''}.`
      });
    }
    
    if (faculties.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No faculty members found in the database."
      });
    }
    
    if (batches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No batches configured. Please configure batches first."
      });
    }
    
    if (rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rooms configured. Please configure rooms first."
      });
    }
    
    if (slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No time slots configured. Please configure time slots first."
      });
    }
    
    console.log(`✅ Found ${courses.length} courses, ${faculties.length} faculties, ${batches.length} batches, ${rooms.length} rooms, ${slots.length} slots`);
    
    // Step 2: Transform data
    console.log("🔄 Transforming data...");
    
    // Create faculty map (email -> employeeId)
    const facultyMap = new Map();
    
    // Create batch map for easy lookup
    const batchMap = new Map();
    for (const batch of batches) {
      batchMap.set(batch.batchId, {
        batch_id: batch.batchId,
        programme: batch.programme,
        size: batch.size
      });
    }
    
    // Generate CSV data
    const teachersData = generateTeachersData(facultyMap, faculties);
    const coursesData = generateCoursesData(courses, facultyMap, batchMap);
    const batchesData = generateBatchesData(batchMap);
    const roomsData = generateRoomsData(rooms);
    const slotsData = generateSlotsData(slots);
    
    // Step 3: Create temporary directory and write CSV files
    console.log("📁 Creating temporary directory and writing CSV files...");
    tempDir = await createTempDir();
    
    const csvFiles = [
      { name: 'teachers.csv', data: teachersData },
      { name: 'courses.csv', data: coursesData },
      { name: 'batches.csv', data: batchesData },
      { name: 'rooms.csv', data: roomsData },
      { name: 'slots.csv', data: slotsData }
    ];
    
    for (const file of csvFiles) {
      const csvContent = arrayToCSV(file.data);
      const filePath = path.join(tempDir, file.name);
      await fs.writeFile(filePath, csvContent);
      console.log(`  ✓ Created ${file.name} (${file.data.length} rows)`);
    }
    
    // Step 4: Copy solver and Python script to temp directory
    console.log("📋 Copying solver and Python script...");
    
    const solverDir = path.join(process.cwd(), 'Scheduling Algorithm', 'build');
    const solverPath = path.join(solverDir, 'timetable_solver');
    const pythonScriptPath = path.join(solverDir, 'csv_to_pdf.py');
    
    const tempSolverPath = path.join(tempDir, 'timetable_solver');
    const tempPythonPath = path.join(tempDir, 'csv_to_pdf.py');
    
    await fs.copyFile(solverPath, tempSolverPath);
    await fs.chmod(tempSolverPath, 0o755); // Make executable
    await fs.copyFile(pythonScriptPath, tempPythonPath);
    
    // Step 5: Execute solver
    console.log("⚙️  Running timetable solver...");
    
    try {
      const { stdout, stderr } = await execPromise('./timetable_solver', {
        cwd: tempDir,
        timeout: 120000 // 2 minutes timeout
      });
      
      if (stderr) {
        console.log("Solver stderr:", stderr);
      }
      if (stdout) {
        console.log("Solver stdout:", stdout);
      }
    } catch (error) {
      console.error("Solver execution error:", error);
      
      // Check if it's a timeout
      if (error.killed) {
        return res.status(504).json({
          success: false,
          message: "Timetable generation timed out. The problem might be too complex or unsolvable with current constraints."
        });
      }
      
      // Check if schedule.csv was created despite error (solver might have found a solution but returned non-zero)
      const scheduleExists = await fs.access(path.join(tempDir, 'schedule.csv')).then(() => true).catch(() => false);
      
      if (!scheduleExists) {
        return res.status(422).json({
          success: false,
          message: "No feasible timetable solution found. Please review constraints (faculty availability, room capacity, etc.)."
        });
      }
    }
    
    // Verify schedule.csv exists
    const schedulePath = path.join(tempDir, 'schedule.csv');
    try {
      await fs.access(schedulePath);
      console.log("✅ schedule.csv generated successfully");
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Solver did not generate schedule.csv file."
      });
    }
    
    // Step 6: Generate PDF
    console.log("📄 Generating PDF...");
    
    const outputPdfPath = path.join(tempDir, 'output.pdf');
    
    try {
      const { stdout, stderr } = await execPromise(
        `python3 csv_to_pdf.py schedule.csv output.pdf`,
        {
          cwd: tempDir,
          timeout: 60000 // 1 minute timeout
        }
      );
      
      if (stderr) {
        console.log("Python stderr:", stderr);
      }
      if (stdout) {
        console.log("Python stdout:", stdout);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF from schedule. Error: " + error.message
      });
    }
    
    // Verify PDF exists
    try {
      await fs.access(outputPdfPath);
      console.log("✅ PDF generated successfully");
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "PDF generation did not create output file."
      });
    }
    
    // Step 7: Send PDF to client
    console.log("📤 Sending PDF to client...");
    
    const pdfBuffer = await fs.readFile(outputPdfPath);
    const filename = semester 
      ? `timetable_semester_${semester}.pdf`
      : 'timetable_all_semesters.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
    console.log("✅ Timetable generation completed successfully!");
    
  } catch (error) {
    console.error("❌ Timetable generation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during timetable generation.",
      error: error.message
    });
  } finally {
    // Cleanup temporary directory
    if (tempDir) {
      console.log("🧹 Cleaning up temporary files...");
      await cleanupTempDir(tempDir);
    }
  }
});

export default router;

