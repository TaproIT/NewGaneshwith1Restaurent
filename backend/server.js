import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./src/config/db-config.js";
import { authRoutes } from "./src/routes/auth-routes.js";
import { corsOptions } from "./src/config/cors-config.js";
import { userRoutes } from "./src/routes/user-routes.js";


// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

// Auth Routes
app.use("/api/v1/auth", authRoutes);

// User Routes
app.use("/api/v1/user", userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});


