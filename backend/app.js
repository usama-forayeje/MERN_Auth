import cookieParser from "cookie-parser";
import cors from 'cors'
import express from "express";
import healthCheckRoute from './src/routes/healthCheck.route.js'
import authRoutes from './src/routes/auth.route.js'
import userRoutes from './src/routes/user.routes.js'
import { errorHandler } from "./src/middleware/errorHandler.middleware.js";
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  })  
);

app.use("/api/v1/healthCheck", healthCheckRoute);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

export default app;
