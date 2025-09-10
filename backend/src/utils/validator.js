import Joi from "joi";

const authValidation = {
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        )
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters long",
          "string.max": "Password must not exceed 128 characters",
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
          "any.required": "Password is required",
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Passwords do not match",
          "any.required": "Password confirmation is required",
        }),
      firstName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          "string.min": "First name must be at least 2 characters long",
          "string.max": "First name must not exceed 50 characters",
          "string.pattern.base":
            "First name can only contain letters and spaces",
          "any.required": "First name is required",
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          "string.min": "Last name must be at least 2 characters long",
          "string.max": "Last name must not exceed 50 characters",
          "string.pattern.base":
            "Last name can only contain letters and spaces",
          "any.required": "Last name is required",
        }),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
      }),
      rememberMe: Joi.boolean().default(false),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required().messages({
        "any.required": "Reset token is required",
      }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        )
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters long",
          "string.max": "Password must not exceed 128 characters",
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
          "any.required": "Password is required",
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Passwords do not match",
          "any.required": "Password confirmation is required",
        }),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        "any.required": "Current password is required",
      }),
      newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        )
        .required()
        .messages({
          "string.min": "New password must be at least 8 characters long",
          "string.max": "New password must not exceed 128 characters",
          "string.pattern.base":
            "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
          "any.required": "New password is required",
        }),
      confirmNewPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "New passwords do not match",
          "any.required": "New password confirmation is required",
        }),
    }),
  },

  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        "any.required": "Refresh token is required",
      }),
    }),
  },

  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required().messages({
        "any.required": "Verification token is required",
      }),
    }),
  },

  resendVerification: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    }),
  },
};

export { authValidation };
