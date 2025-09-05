import authService from "../services/auth.service";
import AuthService from "../services/auth.service";
import { ApiResponse } from "../utils/helpers";
import logger from "../utils/logger";

class AuthController {
  async register(req, res, next) {
    try {
      const userData = req.body;
      const result = await authService.register(userData);

      res
        .status(201)
        .json(ApiResponse.success(result, "User register successfully"));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookies
      res.cookies("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(
        ApiResponse.success(
          {
            user: result.user,
            accessToken: result.accessToken,
          },
          "Login successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res
          .status(401)
          .json(ApiResponse.error("Refresh token not found"));
      }
      const result = await authService.refreshToken(refreshToken);

      res.json(
        ApiResponse.success(
          {
            accessToken: result.accessToken,
          },
          "Token refreshed successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie("refreshToken");
      res.json(ApiResponse.success(null, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const userData = req.body;
      await authService.forgotPassword(userData);

      res.json(ApiResponse.success(null, "Password reset email sent"));
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.json(ApiResponse.success(null, "Password reset successfully"));
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);

      res.json(ApiResponse.success(null, "Email verified successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
