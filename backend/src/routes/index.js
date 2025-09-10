import express from "express";
import authRoutes from "./auth.routes.js";

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);

export default router;
