import mongoose from "mongoose";

const skillMatchSchema = new mongoose.Schema(
  {
    skillName: String,
    resumeHas: Boolean,
    jobRequires: Boolean,
    matchStrength: {
      type: Number,
      min: 0,
      max: 1,
    },
    category: String,
    suggestions: [String],
  },
  { _id: false }
);

const sectionAnalysisSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      enum: [
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
      ],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    keywordAlignement: {
      matched: [String],
      missing: [String],
      score: Number,
    },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["critical", "important", "suggestion", "enhancement"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "content",
        "formatting",
        "keywords",
        "structure",
        "ats",
        "experience",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    impact: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    estimatedImprovement: {
      type: Number,
      min: 0,
      max: 100,
    },
    beforeExample: String,
    afterExample: String,
    actionItems: [String],
  },
  { _id: false }
);

const aiAnalysisSchemea = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    version: String,
    prompt: {
      template: String,
      variables: mongoose.Schema.Types.Mixed,
    },
    response: {
      raw: String,
      structured: mongoose.Schema.Types.Mixed,
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
    },
    processingTime: Number, // milliseconds
    tokenUsage: {
      input: Number,
      output: Number,
      total: Number,
    },
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
      required: true,
      index: true,
    },
    analysisType: {
      type: String,
      enum: ["full", "quick", "skills-only", "ats-only", "custom"],
      default: "full",
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    detailedScoring: {
      skillsMatch: {
        type: Number,
        min: 0,
        max: 100,
      },
      experienceMatch: {
        type: Number,
        min: 0,
        max: 100,
      },
      educationMatch: {
        type: Number,
        min: 0,
        max: 100,
      },
      atsCompatibility: {
        type: Number,
        min: 0,
        max: 100,
      },
      keywordOptimization: {
        type: Number,
        min: 0,
        max: 100,
      },
      formatting: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    skillAnalysis: {
      totalSkillsRequired: Number,
      matchedSkills: [skillMatchSchema],
      missingCriticalSkills: [String],
      additionalSkills: [String],
      skillsGap: {
        percentage: Number,
        priority: [String],
      },
    },
    sectionAnalysis: [sectionAnalysisSchema],
    recommendations: [recommendationSchema],
    aiAnalysis: aiAnalysisSchemea,
    improvements: {
      suggestedChanges: [
        {
          section: String,
          original: String,
          improved: String,
          reason: String,
        },
      ],
      rewrittenSections: [
        {
          sectionName: String,
          originalContent: String,
          improvedContent: String,
          improvements: [String],
        },
      ],
      keywordSuggestions: [
        {
          keyword: String,
          context: String,
          placement: String,
          frequency: Number,
        },
      ],
    },
    atsAnalysis: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      issues: [
        {
          type: String,
          description: String,
          severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
          },
          solution: String,
        },
      ],
      formatting: {
        hasProperHeaders: Boolean,
        usesStandardFonts: Boolean,
        hasContactInfo: Boolean,
        fileFormat: String,
        readability: Number,
      },
    },
    competitorAnalysis: {
      averageScore: Number,
      percentile: Number,
      comparison: [
        {
          metric: String,
          userScore: Number,
          benchmarkScore: Number,
          status: {
            type: String,
            enum: ["above", "at", "below"],
          },
        },
      ],
    },
    metadata: {
      processingStarted: {
        type: Date,
        default: Date.now,
      },
      processingCompleted: Date,
      processingDuration: Number, // milliseconds
      version: {
        type: String,
        default: "1.0",
      },
      flags: [
        {
          type: String,
          reason: String,
          severity: String,
        },
      ],
      feedback: {
        helpful: Boolean,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        submittedAt: Date,
      },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "archived"],
      default: "pending",
    },
    isPublic: {
      type: Boolean,
      default: false,
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
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ resumeId: 1, jobId: 1 });
feedbackSchema.index({ overallScore: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ "metadata.processingCompleted": -1 });

// compound indexes for analytics
feedbackSchema.index({ userId: 1, overallScore: -1, createdAt: -1 });
feedbackSchema.index({ resumeId: 1, overallScore: -1 });

// Virtuals
feedbackSchema.virtual("scoreGrade").get(function () {
  const score = this.overallScore;
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
});

feedbackSchema.virtual("isRecent").get(function () {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

feedbackSchema.virtual("processingTimeFormatted").get(function () {
  if (!this.metadata.processingDuration) return null;
  const seconds = Math.floor(this.metadata.processingDuration / 1000);
  return `${seconds}`;
});

// Methods
feedbackSchema.methods.getTopRecommendations = function (limit = 5) {
  return this.recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
};

feedbackSchema.methods.getCriticalIssues = function () {
  return this.recommendations.filter((rec) => rec.type === "critical");
};

feedbackSchema.methods.markAsCompleted = async function () {
  this.status = "completed";
  this.metadata.processingCompleted = new Date();
  if (this.metadata.processingStarted) {
    this.metadata.processingDuration =
      this.metadata.processingCompleted - this.metadata.processingStarted;
  }
  await this.save();
};

feedbackSchema.methods.addUserFeedback = async function (
  rating,
  comment,
  helpful
) {
  this.metadata.feedback = {
    rating,
    comment,
    helpful,
    submittedAt: new Date(),
  };
  await this.save();
};

// Static methods
feedbackSchema.statics.getAnalyticsForUser = function (userId, dateRange = {}) {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };

  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.created.$gte = dateRange.start;
    if (dateRange.end) matchStage.created.$lte = dateRange.end;
  }
  return this.aggregate([
    { $matcha: matchStage },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        averageScore: { $avg: "$overallScore" },
        highestScore: { $max: "$overallScore" },
        lowestScore: { $min: "$overallScore" },
        scoreDistribution: {
          $push: {
            score: "$overallScore",
            date: "$createdAt",
          },
        },
      },
    },
  ]);
};

feedbackSchema.statics.getScoreTrends = function (userId, period = 30) {
  const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        averageScore: { $avg: "$overallScore" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
};

feedbackSchema.statics.getBenchmarkData = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        overageOverallScore: { $avg: "$overallScore" },
        averageSkillsScore: { $avg: "$detailedScoring.skillsMatch" },
        averageExperienceScore: { $avg: "$detailedScoring.experienceMatch" },
        averageATSScore: { $avg: "$detailedScoring.atsCompatibility" },
        totalAnalyses: { $sum: 1 },
      },
    },
  ]);
};

export default mongoose.model("Feedback", feedbackSchema);
