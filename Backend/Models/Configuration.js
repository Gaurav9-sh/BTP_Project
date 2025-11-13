// Backend/Models/Configuration.js
import mongoose from "mongoose";

// Batch Schema
const batchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true, trim: true },
    programme: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
    year: { type: String, default: "" },
  },
  { timestamps: true }
);

// Room/Lecture Theatre Schema
const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    isLab: { type: Boolean, default: false },
    building: { type: String, default: "" },
    floor: { type: String, default: "" },
  },
  { timestamps: true }
);

// Time Slot Schema
const slotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true, unique: true, trim: true },
    day: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export const Batch = mongoose.model("Batch", batchSchema);
export const Room = mongoose.model("Room", roomSchema);
export const Slot = mongoose.model("Slot", slotSchema);

