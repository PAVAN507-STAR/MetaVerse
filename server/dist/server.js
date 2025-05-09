"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const userRouter_1 = require("./api/userRouter");
const assetRouter_1 = require("./api/assetRouter");
const roomRouter_1 = require("./api/roomRouter");
const spacesRouter_1 = require("./api/spacesRouter");
const roomTypesRouter_1 = require("./api/roomTypesRouter");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express_1.default.json());
// Routes
app.use("/api/user", userRouter_1.userRouter);
app.use("/api/assets", assetRouter_1.assetRouter);
app.use("/api/rooms", roomRouter_1.roomRouter);
app.use("/api/spaces", spacesRouter_1.spacesRouter);
app.use("/api/roomtypes", roomTypesRouter_1.roomTypesRouter);
// Health check route
app.get("/", (_req, res) => res.send("Server running"));
const PORT = process.env.PORT || 5001;
// Connect to DB and start server
(0, db_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
