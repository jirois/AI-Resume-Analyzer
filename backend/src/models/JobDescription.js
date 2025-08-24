import { application } from "express";
import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["required", "preferred", "nice-to-have"],
      default: "required",
    },
    category: {
      type: String,
      enum: ["skill", "experience", "education", "certification", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
  },
  { _id: false }
);

const benefitSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "health",
        "financial",
        "time-off",
        "development",
        "perks",
        "others",
      ],
    },
    description: String,
  },
  { _id: false }
);

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
    },
    company: {
      name: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
      },
      industry: String,
      size: {
        type: String,
        enum: ["startup", "small", "medium", "large", "enterprise"],
      },
      website: String,
      location: {
        city: String,
        state: String,
        country: String,
        remote: {
          type: Boolean,
          default: false,
        },
        hybrid: {
          type: Boolean,
          default: false,
        },
      },
    },
    description: {
      raw: {
        type: String,
        required: [true, "Job description is required"],
        maxlength: [10000, "Job description too long"],
      },
      summary: String,
      responsibilities: [String],
      qualifications: [String],
    },
    requirements: {
      technical: [requirementSchema],
      experience: [
        {
          level: {
            type: String,
            enum: ["entry", "mid", "senior", "lead", "executive"],
          },
          years: {
            min: Number,
            max: Number,
          },
          description: String,
        },
      ],
      education: [
        {
          level: {
            type: String,
            enum: [
              "high-school",
              "associate",
              "bachelor",
              "master",
              "phd",
              "certification",
            ],
          },
          field: String,
          required: {
            type: Boolean,
            default: true,
          },
        },
      ],
      skills: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          category: {
            type: String,
            enum: ["technical", "soft", "language", "tool", "framework"],
          },
          level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "expert"],
          },
          required: {
            type: Boolean,
            default: true,
          },
          weight: {
            type: Number,
            min: 1,
            max: 10,
            default: 5,
          },
        },
      ],
      certifications: [String],
      languages: [
        {
          name: String,
          level: {
            type: String,
            enum: ["basic", "conversational", "fluent", "native"],
          },
        },
      ],
    },
    employment: {
      type: {
        type: String,
        enum: ["full-time", "part-time", "contract", "internship", "freelance"],
        default: "full-time",
      },
      schedule: {
        type: String,
        enum: ["standard", "flexible", "shift", "remote"],
      },
      salary: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: "USD",
        },
        period: {
          type: String,
          enum: ["hourly", "daily", "weekly", "monthly", "yearly"],
          default: "yearly",
        },
        negotiable: {
          type: Boolean,
          default: false,
        },
      },
      benefits: [benefitSchema],
    },
    application: {
      deadline: Date,
      instructions: String,
      contact: {
        name: String,
        email: String,
        phone: String,
      },
      url: String,
      internalRef: String,
    },
    vectorEmbedding: {
      vectorId: {
        type: String,
        unique: true,
        sparse: true,
      },
      provider: {
        type: String,
        enum: ["openai", "pinecone", "weaviate", "chroma"],
        default: "openai",
      },
      lastUpdated: Date,
    },
    metadata: {
      source: {
        type: String,
        enum: ["manual", "url-scraping", "api", "upload"],
        default: "manual",
      },
      sourceUrl: String,
      scrapedAt: Date,
      jobBoardId: String,
      tags: [String],
      status: {
        type: String,
        enum: ["draft", "active", "paused", "expired", "filled"],
        default: "active",
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },
    analytics: {
      viewCount: {
        type: Number,
        default: 0,
      },
      matchCount: {
        type: Number,
        default: 0,
      },
      lastViewed: Date,
      avgMatchScore: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps,
    toJSON: { virtuals: true },
  }
);

// Indexes
jobDescriptionSchema.index({ userId: 1, createdAt: -1 });
jobDescriptionSchema.index({ "company.name": 1 });
jobDescriptionSchema.index({ title: "text", "description.raw": "text" });
jobDescriptionSchema.index({ "requirements.skills.name": 1 });
jobDescriptionSchema.index({ "metadata.status": 1 });
jobDescriptionSchema.index({ "application.deadline": 1 });

// Virtuals
jobDescriptionSchema.virtual("isExpired").get(function () {
  return this.application.deadline && this.application.deadline < new Date();
});

jobDescriptionSchema.virtual("requiredSkill").get(function () {
  return this.requirements.skills.filter((skill) => skill.required);
});

jobDescriptionSchema.virtual("preferredSkills").get(function () {
  return this.requirements.skills.filter((skill) => !skill.required);
});

// Methods
jobDescriptionSchema.methods.extractKeywords = function () {
  const text = `${this.title} ${this.description.raw}`;
  // Simple keyword extraction - in production, use NLP libraries
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
};

jobDescriptionSchema.methods.incrementView = async function () {
  this.analytics.viewCount += 1;
  this.analytics.lastViewed = new Date();
  await this.save();
};

// Static methods
jobDescriptionSchema.statics.findByUser = function (userId, options = {}) {
  const query = this.find({ userId });
  if (options.status) {
    query.where("metadata.status").equals(options.status);
  }
  if (options.active !== false) {
    query.where("metadata.status").ne("expired");
  }
  return query.sort({ createdAt: -1 });
};

jobDescriptionSchema.statics.getPopularSkills = function () {
  return this.aggregate([
    { $unwind: "$requirement.skills" },
    {
      $group: {
        _id: "$requirements.skills.name",
        count: { $sum: 1 },
        avgWeight: { $avg: "$requirements.skills.weight" },
        category: { $first: "$requirements." },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);
};

export default mongoose.model("JobDescription", jobDescriptionSchema);
