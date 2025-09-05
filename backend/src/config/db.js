import mongoose from "mongoose";

export const connectDB = async () => {
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI missing");
await mongoose.connect(uri, { dbName: "cloud_notes" });
console.log("MongoDB connected");
};