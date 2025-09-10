import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/helpers.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Access token required", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return next(new AppError("User not found or inactive", 401));
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    next(error);
  }
};

export default authMiddleware;
