import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";           // ⬅️ match your actual path/case

dotenv.config();

const EMAIL = "hod.cse@lnmiit.ac.in";
const PLAIN = "ChangeMe@123";                  // temp password you seeded

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB:", mongoose.connection.name, "@", mongoose.connection.host);

    const u = await User.findOne({ email: EMAIL }).lean();
    if (!u) {
      console.log("NOT FOUND:", EMAIL);
      process.exit(0);
    }
    console.log("FOUND:", u.email, u.role, u.department);

    const ok = await bcrypt.compare(PLAIN, u.passwordHash);
    console.log("Password match:", ok);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
