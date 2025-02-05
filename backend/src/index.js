import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import cron from 'node-cron';
import fs from 'fs';

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import { connectDB } from "./lib/db.js";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json()); // Parse JSON request bodies
app.use(clerkMiddleware()); // Add Clerk auth to requests
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max size = 10MB
}));

// cron job : delete temp file every 1 hour
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule('0 * * * *', () => {
    if (fs.existsSync(tempDir)) {
        fs.readdir(tempDir, (err, files) => {
            if (err) {
                console.error("error", err);
                return;
            }
            for (const file of files) {
                fs.unlink(path.join(tempDir, file), (err) => { });
            }
        });
    }
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

if (process.env.NODE_ENV === 'production') {
    // Regular routes
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    // Different routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })
}

// Error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // Delegate to default Express error handler
    }
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
});
