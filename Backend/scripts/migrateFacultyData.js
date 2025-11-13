// Backend/scripts/migrateFacultyData.js
// Migration script to update faculty data in User model with employeeId and constraints
// This script helps migrate faculty information to support timetable generation

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../Models/User.js";

// Load .env file
dotenv.config();

// Faculty data to migrate (update this array with your actual faculty data)
const FACULTY_DATA = [
  {
    email: "aisha@lnmiit.ac.in",
    employeeId: "F001",
    unavailableSlots: [], // Example: ["Mon-A", "Tue-B"]
    maxHoursPerDay: 4
  },
  {
    email: "vikram@lnmiit.ac.in",
    employeeId: "F002",
    unavailableSlots: [],
    maxHoursPerDay: 4
  },
  {
    email: "ramesh@lnmiit.ac.in",
    employeeId: "F003",
    unavailableSlots: [],
    maxHoursPerDay: 4
  },
  {
    email: "sania@lnmiit.ac.in",
    employeeId: "F004",
    unavailableSlots: [],
    maxHoursPerDay: 4
  },
  {
    email: "priya@lnmiit.ac.in",
    employeeId: "F005",
    unavailableSlots: [],
    maxHoursPerDay: 4
  }
];

async function migrateFacultyData() {
  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    let updatedCount = 0;
    let notFoundCount = 0;
    let errors = 0;

    console.log("🔄 Migrating faculty data...\n");

    for (const facultyData of FACULTY_DATA) {
      try {
        // Find user by email
        const user = await User.findOne({ email: facultyData.email });

        if (!user) {
          console.log(`❌ User not found: ${facultyData.email}`);
          notFoundCount++;
          continue;
        }

        // Check if user is a faculty
        if (user.role !== "FACULTY") {
          console.log(`⚠️  User ${facultyData.email} is not a FACULTY (role: ${user.role})`);
          continue;
        }

        // Update faculty data
        user.employeeId = facultyData.employeeId;
        user.unavailableSlots = facultyData.unavailableSlots || [];
        user.maxHoursPerDay = facultyData.maxHoursPerDay || 4;

        await user.save();

        console.log(`✅ Updated: ${user.name} (${user.email})`);
        console.log(`   - Employee ID: ${user.employeeId}`);
        console.log(`   - Unavailable Slots: ${user.unavailableSlots.length > 0 ? user.unavailableSlots.join(', ') : 'None'}`);
        console.log(`   - Max Hours/Day: ${user.maxHoursPerDay}\n`);

        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating ${facultyData.email}:`, error.message);
        errors++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Not found: ${notFoundCount}`);
    console.log(`⚠️  Errors: ${errors}`);
    console.log("=".repeat(60) + "\n");

    // Show all faculty members with timetable data
    console.log("📋 All Faculty Members with Timetable Data:");
    console.log("=".repeat(60));
    
    const allFaculty = await User.find({ role: "FACULTY" });
    
    for (const faculty of allFaculty) {
      console.log(`\n👤 ${faculty.name} (${faculty.email})`);
      console.log(`   Employee ID: ${faculty.employeeId || 'NOT SET'}`);
      console.log(`   Department: ${faculty.department || 'NOT SET'}`);
      console.log(`   Unavailable Slots: ${faculty.unavailableSlots && faculty.unavailableSlots.length > 0 ? faculty.unavailableSlots.join(', ') : 'None'}`);
      console.log(`   Max Hours/Day: ${faculty.maxHoursPerDay || 4}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Migration completed successfully!");
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Alternative: Interactive migration (prompts for each faculty)
async function interactiveMigration() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const allFaculty = await User.find({ role: "FACULTY" });

    if (allFaculty.length === 0) {
      console.log("❌ No faculty members found in the database.");
      return;
    }

    console.log(`📋 Found ${allFaculty.length} faculty members\n`);
    console.log("To update a faculty member, you'll need to:");
    console.log("1. Note their email address");
    console.log("2. Add their data to the FACULTY_DATA array in this script");
    console.log("3. Run the script again with: npm run migrate-faculty\n");

    console.log("Current faculty members:");
    console.log("=".repeat(80));

    for (const faculty of allFaculty) {
      const hasData = faculty.employeeId && faculty.employeeId !== '';
      const status = hasData ? '✅' : '⚠️ ';

      console.log(`${status} ${faculty.name} (${faculty.email})`);
      console.log(`   Department: ${faculty.department || 'NOT SET'}`);
      console.log(`   Employee ID: ${faculty.employeeId || 'NOT SET'}`);
      console.log(`   Unavailable Slots: ${faculty.unavailableSlots && faculty.unavailableSlots.length > 0 ? faculty.unavailableSlots.join(', ') : 'None'}`);
      console.log(`   Max Hours/Day: ${faculty.maxHoursPerDay || 'NOT SET (default: 4)'}`);
      console.log("");
    }

    console.log("=".repeat(80));
    console.log("\nℹ️  Example FACULTY_DATA entry:");
    console.log(`{
  email: "professor@lnmiit.ac.in",
  employeeId: "F001",
  unavailableSlots: ["Mon-A", "Tue-B"],  // When faculty is not available
  maxHoursPerDay: 6                       // Maximum teaching hours per day
}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];

if (command === 'list' || command === '--list' || command === '-l') {
  // Just list faculty without migrating
  interactiveMigration();
} else {
  // Perform migration
  migrateFacultyData();
}

