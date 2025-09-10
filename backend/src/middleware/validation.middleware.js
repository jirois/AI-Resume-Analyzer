import Joi from "joi";

const validationSchemas = {
  user: {
    register: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      firstName: Joi.string().min(1).max(50).required(),
      lastName: Joi.string().min(1).max(50).required(),
      phone: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional(),
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
    forgotPassword: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    }),
    resetPassword: Joi.object({
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

    updateProfile: Joi.object({
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
      phone: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional(),
      location: Joi.object({
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
      }).optional(),
    }),
  },
  resume: {
    update: Joi.object({
      title: Joi.string().max(100).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      notes: Joi.string().optional(),
      privacy: Joi.object({
        isPublic: Joi.boolean().optional(),
        anonymized: Joi.boolean().optional(),
      }).optional(),
    }),
  },
  job: {
    create: Joi.object({
      title: Joi.string().max(200).required(),
      company: Joi.object({
        name: Joi.string().required(),
        industry: Joi.string().optional(),
        website: Joi.string().uri().optional(),
      }).optional(),
      description: Joi.object({
        raw: Joi.string().max(10000).required(),
      }).required(),
      requirements: Joi.object({
        skills: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              category: Joi.string()
                .valid("technical", "soft", "language", "tool", "framework")
                .optional(),
              required: Joi.boolean().optional(),
            })
          )
          .optional(),
      }).optional(),
    }),
    update: Joi.object({
      title: Joi.string().max(200).optional(),
      "company.name": Joi.string().optional(),
      "description.raw": Joi.string().max(10000).optional(),
    }),
  },
  analysis: {
    create: Joi.object({
      resumeId: Joi.string()
        .pattern(/^[0-9a-f]{24}$/)
        .required(),
      jobId: Joi.string()
        .pattern(/^[0-9a-f]{24}$/)
        .required(),
      analysisType: Joi.string()
        .valid("full", "quick", "skills-only", "ats-only", "custom")
        .optional(),
    }),
  },
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    next();
  };
};

export { validate, validationSchemas };
