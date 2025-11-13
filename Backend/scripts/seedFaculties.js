// Backend/scripts/seedFaculties.js
// Seed script to populate database with 60 dummy faculty members

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

// Load .env file - dotenv automatically looks for .env in current directory
// Make sure to run this script from the Backend directory: npm run seed-faculties
console.log("🔍 Current working directory:", process.cwd());
const dotenvResult = dotenv.config();
console.log("🔍 Dotenv config result:", dotenvResult.error ? `Error: ${dotenvResult.error.message}` : `Success - parsed ${Object.keys(dotenvResult.parsed || {}).length} variables`);

// Debug: Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error("\n❌ MONGO_URI not found in environment variables!");
  console.error("📁 Current directory:", process.cwd());
  console.error("📁 Looking for .env at:", process.cwd() + '/.env');
  console.error("\n💡 Solution:");
  console.error("   1. Make sure you're in the Backend directory");
  console.error("   2. Run: cd Backend && npm run seed-faculties -- --clear");
  process.exit(1);
}

console.log("✅ MONGO_URI loaded successfully\n");

// Generate realistic faculty data
const FIRST_NAMES = [
  "Rajesh", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Suresh", "Kavita",
  "Ramesh", "Deepika", "Arun", "Meera", "Sanjay", "Pooja", "Manoj", "Nisha",
  "Kiran", "Sunita", "Ashok", "Rekha", "Praveen", "Anjali", "Mohit", "Shalini",
  "Ravi", "Swati", "Vijay", "Divya", "Ajay", "Neha", "Rakesh", "Madhuri",
  "Sandeep", "Preeti", "Naveen", "Ritu", "Dinesh", "Shweta", "Pankaj", "Aarti",
  "Rohit", "Seema", "Gaurav", "Pratibha", "Nitin", "Usha", "Abhishek", "Jyoti",
  "Mahesh", "Sapna", "Rahul", "Vandana", "Sunil", "Archana", "Anil", "Geeta",
  "Rajiv", "Poonam", "Harsh", "Rashmi"
];

const LAST_NAMES = [
  "Sharma", "Kumar", "Singh", "Verma", "Gupta", "Jain", "Patel", "Mehta",
  "Shah", "Reddy", "Iyer", "Nair", "Rao", "Desai", "Chopra", "Kapoor",
  "Malhotra", "Agarwal", "Bansal", "Saxena", "Khanna", "Bhatia", "Sethi", "Arora",
  "Chauhan", "Pandey", "Mishra", "Dubey", "Tiwari", "Joshi", "Bhatt", "Kulkarni"
];

const DESIGNATIONS = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."];

const DEPARTMENTS = [
  { name: "CSE", fullName: "Computer Science and Engineering" },
  { name: "CCE", fullName: "Communication and Computer Engineering" },
  { name: "ECE", fullName: "Electronics and Communication Engineering" },
  { name: "MME", fullName: "Mechanical-Mechatronics Engineering" },
  { name: "PHY", fullName: "Physics" },
  { name: "HSC", fullName: "Humanities and Social Sciences" },
  { name: "MAT", fullName: "Mathematics" }
];

// Sample slot IDs for unavailable slots
const SAMPLE_SLOTS = [
  "Mon-A", "Mon-B", "Mon-C", "Mon-D", "Mon-E",
  "Tue-A", "Tue-B", "Tue-C", "Tue-D", "Tue-E",
  "Wed-A", "Wed-B", "Wed-C", "Wed-D", "Wed-E",
  "Thu-A", "Thu-B", "Thu-C", "Thu-D", "Thu-E",
  "Fri-A", "Fri-B", "Fri-C", "Fri-D", "Fri-E"
];

// Helper function to generate random unavailable slots
function generateUnavailableSlots() {
  const numSlots = Math.floor(Math.random() * 4); // 0-3 unavailable slots
  const slots = [];
  
  for (let i = 0; i < numSlots; i++) {
    const randomSlot = SAMPLE_SLOTS[Math.floor(Math.random() * SAMPLE_SLOTS.length)];
    if (!slots.includes(randomSlot)) {
      slots.push(randomSlot);
    }
  }
  
  return slots;
}

// Helper function to generate random max hours
function generateMaxHours() {
  const hours = [3, 4, 4, 4, 5, 5, 6]; // Weighted towards 4-5 hours
  return hours[Math.floor(Math.random() * hours.length)];
}

// Generate 60 faculty members
function generateFacultyData() {
  const faculties = [];
  let employeeIdCounter = 1;
  
  for (let i = 0; i < 60; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const designation = DESIGNATIONS[Math.floor(Math.random() * DESIGNATIONS.length)];
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    
    const fullName = `${designation} ${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 30 ? (i - 30) : ''}@lnmiit.ac.in`;
    const employeeId = `${department.name}${String(employeeIdCounter).padStart(3, '0')}`;
    
    faculties.push({
      name: fullName,
      email: email,
      passwordHash: bcrypt.hashSync("password123", 10), // Default password
      role: "FACULTY",
      department: department.name,
      employeeId: employeeId,
      unavailableSlots: generateUnavailableSlots(),
      maxHoursPerDay: generateMaxHours()
    });
    
    employeeIdCounter++;
    if (employeeIdCounter > 999) employeeIdCounter = 1; // Reset if needed
  }
  
  return faculties;
}

async function seedFaculties() {
  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Check if faculties already exist
    const existingCount = await User.countDocuments({ role: "FACULTY" });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing faculty members.`);
      console.log("\nOptions:");
      console.log("1. Run with --clear flag to delete existing faculties first");
      console.log("2. Run with --force flag to add new faculties anyway");
      console.log("\nExample: npm run seed-faculties -- --clear\n");
      
      const args = process.argv.slice(2);
      
      if (args.includes('--clear')) {
        console.log("🗑️  Clearing existing faculties...");
        const result = await User.deleteMany({ role: "FACULTY" });
        console.log(`✅ Deleted ${result.deletedCount} existing faculty members\n`);
      } else if (!args.includes('--force')) {
        console.log("❌ Aborting to prevent duplicates. Use --clear or --force flag.");
        process.exit(0);
      }
    }

    // Generate faculty data
    console.log("🎲 Generating 60 faculty members...\n");
    const faculties = generateFacultyData();

    // Insert faculties
    console.log("📝 Inserting faculties into database...");
    const result = await User.insertMany(faculties);
    console.log(`✅ Successfully inserted ${result.length} faculty members!\n`);

    // Display summary
    console.log("=" .repeat(80));
    console.log("📊 FACULTY SEEDING SUMMARY");
    console.log("=".repeat(80));
    
    // Count by department
    const deptCounts = {};
    faculties.forEach(f => {
      deptCounts[f.department] = (deptCounts[f.department] || 0) + 1;
    });
    
    console.log("\n📋 Faculty Distribution by Department:");
    Object.entries(deptCounts).forEach(([dept, count]) => {
      const deptInfo = DEPARTMENTS.find(d => d.name === dept);
      console.log(`   ${dept} (${deptInfo.fullName}): ${count} faculties`);
    });
    
    console.log("\n📧 Sample Faculty Members:");
    console.log("-".repeat(80));
    faculties.slice(0, 5).forEach(f => {
      console.log(`👤 ${f.name}`);
      console.log(`   Email: ${f.email}`);
      console.log(`   Employee ID: ${f.employeeId}`);
      console.log(`   Department: ${f.department}`);
      console.log(`   Unavailable Slots: ${f.unavailableSlots.length > 0 ? f.unavailableSlots.join(', ') : 'None'}`);
      console.log(`   Max Hours/Day: ${f.maxHoursPerDay}`);
      console.log(`   Password: password123 (default)\n`);
    });
    console.log(`   ... and ${faculties.length - 5} more faculty members`);
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ FACULTY SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
    
    console.log("\n💡 Quick Tips:");
    console.log("   • Default password for all faculties: password123");
    console.log("   • Faculty can login with their email and default password");
    console.log("   • Employee IDs follow format: DEPT001, DEPT002, etc.");
    console.log("   • Unavailable slots randomly assigned (0-3 per faculty)");
    console.log("   • Max hours per day randomly set (3-6 hours)");
    
    console.log("\n🔍 To view all faculties:");
    console.log("   npm run list-faculty");
    
    console.log("\n🧹 To clear faculties and re-seed:");
    console.log("   npm run seed-faculties -- --clear\n");

  } catch (error) {
    console.error("\n❌ SEEDING FAILED:", error.message);
    console.error(error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("👋 Database connection closed\n");
  }
}

// Run seeding
seedFaculties();

