// Backend/scripts/seedConfigurations.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Batch, Room, Slot } from "../Models/Configuration.js";

dotenv.config();

const BATCHES = [
  { batchId: "B23", programme: "CSE Y23", size: 110, year: "2023" },
  { batchId: "B22", programme: "ECE Y22", size: 95, year: "2022" },
  { batchId: "B21", programme: "ME Y21", size: 85, year: "2021" },
  { batchId: "B24", programme: "BIO Y24", size: 60, year: "2024" },
];

const ROOMS = [
  { roomId: "L1", capacity: 120, isLab: false, building: "Academic Block", floor: "1st" },
  { roomId: "L2", capacity: 120, isLab: false, building: "Academic Block", floor: "1st" },
  { roomId: "L3", capacity: 60, isLab: false, building: "Academic Block", floor: "2nd" },
  { roomId: "L4", capacity: 40, isLab: true, building: "Lab Block", floor: "1st" },
  { roomId: "L5", capacity: 60, isLab: true, building: "Lab Block", floor: "2nd" },
  { roomId: "L6", capacity: 80, isLab: false, building: "Main Building", floor: "3rd" },
  { roomId: "L7", capacity: 50, isLab: false, building: "Main Building", floor: "2nd" },
  { roomId: "Lab1", capacity: 30, isLab: true, building: "Lab Block", floor: "Ground" },
];

const SLOTS = [
  { slotId: "Mon-A", day: "Monday", startTime: "08:00", endTime: "09:00" },
  { slotId: "Mon-B", day: "Monday", startTime: "09:00", endTime: "10:00" },
  { slotId: "Mon-C", day: "Monday", startTime: "10:00", endTime: "11:00" },
  { slotId: "Mon-D", day: "Monday", startTime: "11:00", endTime: "12:00" },
  { slotId: "Mon-E", day: "Monday", startTime: "12:00", endTime: "13:00" },
  
  { slotId: "Tue-A", day: "Tuesday", startTime: "08:00", endTime: "09:00" },
  { slotId: "Tue-B", day: "Tuesday", startTime: "09:00", endTime: "10:00" },
  { slotId: "Tue-C", day: "Tuesday", startTime: "10:00", endTime: "11:00" },
  { slotId: "Tue-D", day: "Tuesday", startTime: "11:00", endTime: "12:00" },
  { slotId: "Tue-E", day: "Tuesday", startTime: "12:00", endTime: "13:00" },
  
  { slotId: "Wed-A", day: "Wednesday", startTime: "08:00", endTime: "09:00" },
  { slotId: "Wed-B", day: "Wednesday", startTime: "09:00", endTime: "10:00" },
  { slotId: "Wed-C", day: "Wednesday", startTime: "10:00", endTime: "11:00" },
  { slotId: "Wed-D", day: "Wednesday", startTime: "11:00", endTime: "12:00" },
  { slotId: "Wed-E", day: "Wednesday", startTime: "12:00", endTime: "13:00" },
  
  { slotId: "Thu-A", day: "Thursday", startTime: "08:00", endTime: "09:00" },
  { slotId: "Thu-B", day: "Thursday", startTime: "09:00", endTime: "10:00" },
  { slotId: "Thu-C", day: "Thursday", startTime: "10:00", endTime: "11:00" },
  { slotId: "Thu-D", day: "Thursday", startTime: "11:00", endTime: "12:00" },
  { slotId: "Thu-E", day: "Thursday", startTime: "12:00", endTime: "13:00" },
  
  { slotId: "Fri-A", day: "Friday", startTime: "08:00", endTime: "09:00" },
  { slotId: "Fri-B", day: "Friday", startTime: "09:00", endTime: "10:00" },
  { slotId: "Fri-C", day: "Friday", startTime: "10:00", endTime: "11:00" },
  { slotId: "Fri-D", day: "Friday", startTime: "11:00", endTime: "12:00" },
  { slotId: "Fri-E", day: "Friday", startTime: "12:00", endTime: "13:00" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Batch.deleteMany({});
    await Room.deleteMany({});
    await Slot.deleteMany({});
    console.log("🗑️  Cleared existing configuration data");

    // Seed batches
    await Batch.insertMany(BATCHES);
    console.log(`✅ Seeded ${BATCHES.length} batches`);

    // Seed rooms
    await Room.insertMany(ROOMS);
    console.log(`✅ Seeded ${ROOMS.length} rooms`);

    // Seed slots
    await Slot.insertMany(SLOTS);
    console.log(`✅ Seeded ${SLOTS.length} time slots`);

    console.log("\n✨ Configuration data seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  }
})();


