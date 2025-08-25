import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import scholarRoutes from "./routes/scholarRoutes.js";
import drcMeetingRoutes from "./routes/drcMeetingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import connectDB from "./configuration/connectDB.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
const minutesDir = path.join(uploadsDir, "minutes");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(minutesDir)) {
  fs.mkdirSync(minutesDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);

// Handle preflight requests
app.options("*", cors());

// Debug middleware for CORS issues
app.use((req, res, next) => {
  console.log(`🔔 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  console.log(`🔔 Method: ${req.method}`);
  console.log(`🔔 Path: ${req.path}`);
  console.log(`🔔 Headers:`, req.headers);
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    console.log("🔔 Handling OPTIONS preflight request");
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(200).end();
    return;
  }
  
  next();
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/scholars", scholarRoutes);
app.use("/api/drc-meetings", drcMeetingRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
