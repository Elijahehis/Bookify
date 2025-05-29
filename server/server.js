import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkwebhook from "./controller/clerkWebHook.js";

const startServer = async () => {
    try {
        await connectDB(); // 🧠 Wait for MongoDB to connect before starting the server

        const app = express();

        app.use(cors());
        app.use(express.json());
        app.use(clerkMiddleware());
        app.use("/api/clerk", clerkwebhook);

        app.get("/", (req, res) => {
            res.send("API is working");
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to DB:", error);
        process.exit(1); // Exit process if DB fails
    }
};

startServer();
