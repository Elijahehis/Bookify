import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkwebhook from "./controller/clerkWebHook.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotel.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouterRouter from "./routes/bookingRoutes.js";
import { stripeWebHooks } from "./controller/stripeWebhooks.js";

const startServer = async () => {
  try {
    await connectDB(); // 🧠 Wait for MongoDB to connect before starting the server
    connectCloudinary();

    const app = express();

    app.use(
      cors({
        origin: [
          "http://localhost:5173",
          "https://bookify-backend-nine.vercel.app",
        ],
        credentials: true,
      })
    );

    app.post(
      "/api/stripe",
      express.raw({ type: "application/json" }),
      stripeWebHooks
    );

    app.use(express.json());
    app.use(clerkMiddleware());

    app.use("/api/clerk", clerkwebhook);

    app.get("/", (req, res) => {
      res.send("API is working");
    });

    app.use("/api/user", userRouter);
    app.use("/api/hotels", hotelRouter);
    app.use("/api/rooms", roomRouter);
    app.use("/api/booking", bookingRouterRouter);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1); // Exit process if DB fails
  }
};

startServer();
