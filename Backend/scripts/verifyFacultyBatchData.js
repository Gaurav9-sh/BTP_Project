// Script to verify Faculty Assignment and Student Batch data in database
import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../Models/Courses.js";

dotenv.config();

async function verifyData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all courses that have faculty assignments or student batches
    const coursesWithData = await Course.find({
      $or: [
        { "facultyAssignments.0": { $exists: true } },
        { "studentBatches.0": { $exists: true } }
      ]
    });

    console.log("=" .repeat(80));
    console.log("📊 CENTRAL MANAGEMENT DATA VERIFICATION");
    console.log("=" .repeat(80));
    console.log(`\nTotal courses with faculty/batch assignments: ${coursesWithData.length}\n`);

    if (coursesWithData.length === 0) {
      console.log("⚠️  No courses have faculty or batch assignments yet.");
      console.log("   Go to Central Management tab and assign some faculty/batches!\n");
    } else {
      coursesWithData.forEach((course, index) => {
        console.log(`\n${index + 1}. ${course.CCODE} - ${course.courseName}`);
        console.log("   " + "-".repeat(70));
        
        // Faculty Assignments
        if (course.facultyAssignments && course.facultyAssignments.length > 0) {
          console.log("   👨‍🏫 Faculty Assignments:");
          course.facultyAssignments.forEach((assignment) => {
            const coordinator = assignment.isCoordinator ? " (COORDINATOR)" : "";
            console.log(`      • ${assignment.facultyEmail}${coordinator}`);
          });
        } else {
          console.log("   👨‍🏫 Faculty Assignments: None");
        }

        // Student Batches
        if (course.studentBatches && course.studentBatches.length > 0) {
          console.log("   🎓 Student Batches:");
          console.log(`      • ${course.studentBatches.join(", ")}`);
          
          // Calculate total students (assuming 120 per batch)
          const totalStudents = course.studentBatches.length * 120;
          console.log(`      • Total Students: ${totalStudents}`);
        } else {
          console.log("   🎓 Student Batches: None");
        }

        // Sharing Type
        console.log(`   🔄 Sharing Type: ${course.sharingType || "Horizontal"}`);
      });
    }

    // Summary statistics
    console.log("\n" + "=" .repeat(80));
    console.log("📈 SUMMARY STATISTICS");
    console.log("=" .repeat(80));
    
    const totalCourses = await Course.countDocuments();
    const coursesWithFaculty = await Course.countDocuments({ "facultyAssignments.0": { $exists: true } });
    const coursesWithBatches = await Course.countDocuments({ "studentBatches.0": { $exists: true } });
    
    console.log(`\nTotal Courses in Database: ${totalCourses}`);
    console.log(`Courses with Faculty Assigned: ${coursesWithFaculty}`);
    console.log(`Courses with Batches Assigned: ${coursesWithBatches}`);
    console.log(`Courses Missing Assignments: ${totalCourses - coursesWithData.length}`);

    console.log("\n" + "=" .repeat(80));
    console.log("✅ Verification Complete!");
    console.log("=" .repeat(80) + "\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verifyData();

