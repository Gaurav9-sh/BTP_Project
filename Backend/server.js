// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import coursesRoutes from "./Routes/coureses.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // parse JSON
app.use(cors()); // allow cross-origin requests

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
app.use("/api/courses", coursesRoutes);
// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
