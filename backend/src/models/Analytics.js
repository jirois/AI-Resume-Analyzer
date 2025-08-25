import mongoose from "mongoose";
import User from "./User";
import Resume from "./Resume";
import JobDescription from "./JobDescription";
import Feedback from "./Feedback";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: String,
    activities: [
      {
        action: {
          type: String,
          enum: [
            "login",
            "logout",
            "upload_resume",
            "create_job",
            "run_analysis",
            "view_feedback",
            "download_report",
            "update_profile",
            "subscription_change",
          ],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          ip: String,
          userAgent: String,
          duration: Number, // milliseconds
          success: {
            type: Boolean,
            default: true,
          },
          error: String,
          resourceId: mongoose.Schema.Types.ObjectId,
          additionalData: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    date: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
  },
  {
    timestamps: true,
  }
);

const systemMetricsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    metrics: {
      users: {
        total: Number,
        new: Number,
        active: Number,
        premium: Number,
      },
      resumes: {
        uploaded: Number,
        processed: Number,
        failed: Number,
      },
      analyses: {
        performed: Number,
        avgScore: Number,
        avgProcessingTime: Number,
      },
      api: {
        requests: Number,
        errors: Number,
        avgResponseTime: Number,
      },
      costs: {
        aiApi: Number,
        storage: Number,
        compute: Number,
        total: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for Analytics
userActivitySchema.index({ userId: 1, date: -1 });
userActivitySchema.index({ "activities.action": 1 });
userActivitySchema.index({ "activities.timestamp": -1 });

systemMetricsSchema.index({ date: -1 });

// User Activity Model
const UserActivity = mongoose.model("UserActivity", userActivitySchema);

// System Metrics Model
const SystemMetrics = mongoose.model("SystemMetrics", systemMetricsSchema);

// Static method to log user activity
UserActivity.logActivity = async function (userId, action, metadata = {}) {
  const today = new Date().setHours(0, 0, 0, 0);
  try {
    await this.findOneAndUpdate(
      {
        userId,
        date: today,
      },
      {
        $push: {
          activities: {
            action,
            metadata,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
};

// Get User activity summary
UserActivity.getUserSummary = function (userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    { $unwind: "$activities" },
    {
      $group: {
        _id: "$activities.action",
        count: { $sum: 1 },
        lastActivity: { $max: "$activities.timestamp" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

export { User, JobDescription, Resume, Feedback, UserActivity, SystemMetrics };
