import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "moas_tech",
  });

  console.log("MongoDB connected");
}
