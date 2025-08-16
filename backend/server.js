import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db-config.js";
import { authRoutes } from "./src/routes/auth-routes.js";
import { userRoutes } from "./src/routes/user-routes.js";
import { bookingRoutes } from "./src/routes/booking-routes.js";
import { roomRoutes } from "./src/routes/room-routes.js";
import * as http from "node:http";
import { Server } from "socket.io";
import { setupRoomSocket} from "./src/utils/realtime/room-socket.js";

// Load env variables
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedSocketOrigins = process.env.SOCKET_IO_ORIGINS.split(',');
const allowedApiOrigins = process.env.API_ORIGINS.split(',');

// --- Middleware ---
app.use(cors({
    origin: allowedApiOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

//       --- Main Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
// --- booking ---
app.use("/api/v1/booking", bookingRoutes);
// -- room handling ---
app.use("/api/v1/room", roomRoutes);

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
