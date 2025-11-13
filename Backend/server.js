// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import coursesRoutes from "./Routes/coureses.js";
import authRoutes from "./Routes/auth.js";
import hodRoutes from "./Routes/hod.js";
import configurationsRoutes from "./Routes/configurations.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
 .then(async () => {
    console.log("✅ MongoDB connected");

    // 🔍 Debugging: list all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map(c => c.name));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// Test route
app.get("/", (req, res) => {
  res.send("Course Schedule Management System Backend Running 🚀");
});

// ADD THIS NEW TEST ROUTE
app.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

app.get("/test-departments", async (req, res) => {
  const Course = (await import("./Models/Courses.js")).default;
  const departments = await Course.distinct("department");
  res.json({ departments });
});

app.use("/api/courses", coursesRoutes);
// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.use("/api/auth", authRoutes);   
app.use("/api/hod", hodRoutes);
app.use("/api/configurations", configurationsRoutes);