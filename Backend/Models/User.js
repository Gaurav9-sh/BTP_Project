// Backend/Models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }, // store hashed password
    role: { type: String, enum: ["ADMIN", "HOD", "FACULTY", "STAFF"], default: "FACULTY" },
    department: { type: String, enum: ["CSE","CCE","ECE","MME","PHY","HSC","MAT",""], default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
