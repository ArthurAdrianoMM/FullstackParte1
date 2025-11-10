import app from "../src/app";
import { connectDB } from "../src/database/connection";

// Connect to MongoDB (will reuse connection on subsequent invocations)
let isConnected = false;

const connectMongoDB = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      // Don't throw - allow the request to proceed, connection will retry
    }
  }
};

// Vercel serverless function handler
// Using any types as Vercel provides the runtime types
export default async function handler(req: any, res: any) {
  // Connect to MongoDB on first request
  await connectMongoDB();
  
  // Handle the request using Express app
  return app(req, res);
}

