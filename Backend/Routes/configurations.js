// Backend/Routes/configurations.js
import express from "express";
import { Batch, Room, Slot } from "../Models/Configuration.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ============ BATCH ROUTES ============

// Get all batches
router.get("/batches", requireAuth, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ batchId: 1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a batch
router.post("/batches", requireAuth, async (req, res) => {
  try {
    const batch = new Batch(req.body);
    const savedBatch = await batch.save();
    res.status(201).json(savedBatch);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Batch ID already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update a batch
router.put("/batches/:id", requireAuth, async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a batch
router.delete("/batches/:id", requireAuth, async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json({ message: "Batch deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ ROOM ROUTES ============

// Get all rooms
router.get("/rooms", requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomId: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a room
router.post("/rooms", requireAuth, async (req, res) => {
  try {
    const room = new Room(req.body);
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Room ID already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update a room
router.put("/rooms/:id", requireAuth, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a room
router.delete("/rooms/:id", requireAuth, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ SLOT ROUTES ============

// Get all slots
router.get("/slots", requireAuth, async (req, res) => {
  try {
    const slots = await Slot.find().sort({ day: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a slot
router.post("/slots", requireAuth, async (req, res) => {
  try {
    const slot = new Slot(req.body);
    const savedSlot = await slot.save();
    res.status(201).json(savedSlot);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Slot ID already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update a slot
router.put("/slots/:id", requireAuth, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a slot
router.delete("/slots/:id", requireAuth, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

