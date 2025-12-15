import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db-config.js";
import { authRoutes } from "./src/routes/auth-routes.js";
import { corsOptions } from "./src/config/cors-config.js";
import { userRoutes } from "./src/routes/user-routes.js";
import { bookingRoutes } from "./src/routes/Reception/booking-routes.js";
import { roomRoutes } from "./src/routes/room-routes.js";
import * as http from "node:http";
import { Server } from "socket.io";
import { setupRoomSocket} from "./src/utils/realtime/room-socket.js";
import {orderRoutes} from "./src/routes/order-routes.js";
import { pbfoodnetCategoryRoutes } from  "./src/routes/PoolAndBeachResturant/pbfoodnetCategoryRoutes.js";
import { beverageRoutes } from "./src/routes/Beverage/beverageRoutes.js";
import {pbfoodnetRoutes} from "./src/routes/PoolAndBeachResturant/pbfoodnetRoutes.js";
import {scheduleExtendCheckoutCron} from "./src/utils/scheduleExtendCheckouts.js";
import { invoiceRoutes } from "./src/routes/Reception/invoice-routes.js";
import extraBeverageRoutes from "./src/routes/ExtraBeverageRoutes/extra-beverage-routes.js";
import { adminRoutes } from "./src/routes/Admin/user-handelling-routes.js";
import currencyValueRoutes from "./src/routes/currency-value-routes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import reportRoutes from "./src/routes/Excel/room-report.js";

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedSocketOrigins = process.env.SOCKET_IO_ORIGINS.split(',');
const allowedApiOrigins = process.env.API_ORIGINS.split(',');

// --- Middleware ---

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Now allowedApiOrigins is an ARRAY, so .includes() works correctly
        if (allowedApiOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            // This now safely blocks the request instead of crashing
            console.log("Not allowed by CORS");
            return callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

//       --- Main Routes ---
app.use("/api/v1/auth", authRoutes);

// User Routes
app.use("/api/v1/user", userRoutes);
// --- Reception/booking ---
app.use("/api/v1/booking", bookingRoutes);
// --- Reception/invoice ---
app.use("/api/v1/invoice", invoiceRoutes);
// -- room handling ---
app.use("/api/v1/room", roomRoutes);

// Order Routes
app.use("/api/v1/order", orderRoutes);

app.use("/api/v1/pbfoodcategories", pbfoodnetCategoryRoutes);
app.use("/api/v1/beverages", beverageRoutes);
app.use("/api/v1/pbfoodnets", pbfoodnetRoutes);

// extra beverages
app.use("/api/v1/extra-beverages", extraBeverageRoutes);

// Admin Routes
app.use("/api/v1/admin", adminRoutes);

// currency
app.use("/api/v1/currency-values", currencyValueRoutes);

// monthly-summary
app.use("/api/v1/hotel-dashboard", dashboardRoutes);

//Reports
app.use("/api/v1/reports", reportRoutes);

// --- Socket.io ---
const io = new Server(server, {
    cors: {
        origin: allowedSocketOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// each Sockets
setupRoomSocket(io);

app.set("io", io);

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// CRON
scheduleExtendCheckoutCron();