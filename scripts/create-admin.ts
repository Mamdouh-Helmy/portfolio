import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Admin } from "../src/models/Admin";

const { MONGODB_URI, NEW_ADMIN_EMAIL: email, NEW_ADMIN_PASSWORD: password } = process.env;
if (!MONGODB_URI || !email || !password) throw new Error("Set MONGODB_URI, NEW_ADMIN_EMAIL, NEW_ADMIN_PASSWORD");
if (password.length < 12) throw new Error("Password must be at least 12 chars");

(async () => {
  await mongoose.connect(MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.updateOne(
    { email: email.toLowerCase() },
    { $set: { passwordHash, failedAttempts: 0, lockUntil: null }, $inc: { tokenVersion: 1 } },
    { upsert: true },
  );
  console.log("Admin ready:", email);
  await mongoose.disconnect();
})();