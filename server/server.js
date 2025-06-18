import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebHook from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoute.js";
import hotelRouter from "./routes/hotelRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import roomRouter from "./routes/roomRoute.js";
import bookingRouter from "./routes/bookRoute.js";
connectCloudinary()
const app = express();
// Middleware
app.use(cors());
app.use(express.json()); 
app.use(clerkMiddleware())


// Basic route
app.get("/", (req, res) => {res.send("API is working"); });

//Api to listen to Clerk Webhooks
app.use("/api/clerk",clerkWebHook)
app.use("/api/user",userRouter)
app.use("/api/hotels",hotelRouter)
app.use("/api/rooms",roomRouter)
app.use("/api/booking",bookingRouter)

const PORT = process.env.PORT || 8001;

// Start server after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("DB connection failed:", err.message);
});
