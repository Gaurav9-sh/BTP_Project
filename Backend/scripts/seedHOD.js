// Backend/scripts/seedHODs.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

dotenv.config();

const HODS = [
  { name: "HOD CSE", email: "hod.cse@lnmiit.ac.in", department: "CSE" },
  { name: "HOD CCE", email: "hod.cce@lnmiit.ac.in", department: "CCE" },
  { name: "HOD ECE", email: "hod.ece@lnmiit.ac.in", department: "ECE" },
  { name: "HOD MME", email: "hod.mme@lnmiit.ac.in", department: "MME" },
  { name: "HOD PHY", email: "hod.phy@lnmiit.ac.in", department: "PHY" },
  { name: "HOD HSC", email: "hod.hsc@lnmiit.ac.in", department: "HSC" },
  { name: "HOD MAT", email: "hod.mat@lnmiit.ac.in", department: "MAT" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const passwordHash = await bcrypt.hash("ChangeMe@123", 10); // TEMP password for all HODs

    for (const x of HODS) {
      await User.updateOne(
        { email: x.email },
        {
          $set: {
            name: x.name,
            email: x.email,
            role: "HOD",
            department: x.department,
            passwordHash,
          },
        },
        { upsert: true }
      );
    }

    console.log("✅ Seeded HOD users with temp password: ChangeMe@123");
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  }
})();
