import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { getRedisClient } from "../configs/redis.js";
import emailService from "./email.service.js";
import { AppError } from "../utils/helpers.js";

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists with this email", 400);
    }

    // Create user
    const user = new User({
      email,
      password,
      profile: { firstName, lastName },
    });

    await user.save();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.security.emailVerificationToken = verificationToken;
    await user.save();

    // Send verification email
    await emailService.sendEmailVerification(
      email,
      firstName,
      verificationToken
    );

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }
  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isActive) {
      throw new AppError("Account is deactivated", 401);
    }

    // Update last login
    user.security.lastLogin = new Date();
    user.security.loginAttempts = 0;
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if token is blacklisted
      const redis = getRedisClient();
      const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);

      if (isBlacklisted) {
        throw new AppError("Invalid refresh token", 401);
      }
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  async logout(refreshToken) {
    try {
      // Add refresh token to blacklist
      const redis = getRedisClient();
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      if (expiresIn > 0) {
        await redis.setex(`blacklist:${refreshToken}`, expiresIn, "true");
      }
    } catch (error) {}
  }

  async forgotPassword(userData) {
    const { email, firstName } = userData;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return;
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.security.passwordResetToken = resetToken;
    user.security.passwordResetExpires = new Date(Date.now() * 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(email, firstName, resetToken);
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      "security.passwordResetToken": token,
      "security.passwordResetExpires": { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Update password
    user.password = newPassword;
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpires = undefined;

    await user.save();
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      "security.emailVerificationToken": token,
    });
    if (!user) {
      throw new AppError("Invalid verification token", 400);
    }

    user.security.emailVerified = true;
    user.security.emailVerificationToken = undefined;
    await user.save();
  }

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
  }
  sanitizeUser(user) {
    const { password, security, ...sanitizeUser } = user.toObject();
    return sanitizeUser;
  }
}

export default new AuthService();
