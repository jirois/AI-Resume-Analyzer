import mongoose from "mongoose";

const personalInfoSchema = new mongoose.Schema(
  {
    name: {
      first: String,
      last: String,
      full: String,
    },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function (email) {
          return (
            !email ||
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
          );
        },
        message: "Invalid email format",
      },
    },
    phone: String,
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    links: {
      linkedin: String,
      github: String,
      portfolio: String,
      website: String,
      other: [String],
    },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    department: String,
    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "freelance",
        "temporary",
      ],
    },
    location: {
      city: String,
      state: String,
      country: String,
      remote: Boolean,
    },
    duration: {
      startDate: Date,
      endDate: Date,
      current: {
        type: Boolean,
        default: false,
      },
      totalMonths: Number,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    achievements: [String],
    technologies: [String],
    skills: [String],
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    field: String,
    specialization: String,
    gpa: {
      value: Number,
      scale: {
        type: Number,
        default: 4.0,
      },
    },
    duration: {
      startDate: Date,
      endDate: Date,
      graduationDate: Date,
    },
    honors: [String],
    revelantCourseWork: [String],
    activities: [String],
    location: {
      city: String,
      state: String,
      country: String,
    },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "technical",
        "soft",
        "language",
        "certification",
        "tool",
        "framework",
      ],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
    },
    yearsOfExperience: Number,
    lastUsed: Date,
    verified: Boolean,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    role: String,
    technologies: [String],
    duration: {
      startDate: Date,
      endDate: Date,
    },
    urls: {
      demo: String,
      github: String,
      documentation: String,
    },
    achievements: [String],
    teamSize: Number,
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: Date,
    expiryDate: Date,
    CredentialId: String,
    CredentialUrl: String,
    skills: [String],
  },
  { _id: false }
);

const fileMetadataSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    fileName: String,
    mimeType: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
          ].includes(v);
        },
        message: "Unsupported file type",
      },
    },
    size: {
      type: Number,
      required: true,
      max: [10 * 1024 * 1024, "File size cannot exceed 10MB"],
    },
    url: String,
    cloudinaryPublicId: String,
    pages: Number,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const vectorEmbeddingSchema = new mongoose.Schema(
  {
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
    model: {
      type: String,
      default: "text-embedding-ada-002",
    },
    dimensions: {
      type: Number,
      default: 1536,
    },
    chunks: [
      {
        chunkId: String,
        content: String,
        metadata: {
          section: String,
          startIndex: Number,
          endIndex: Number,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["uploading", "processing", "processed", "failed", "archived"],
      default: "uploading",
    },
    fileMetadata: {
      type: fileMetadataSchema,
      required: true,
    },
    extractedText: {
      raw: String,
      cleaned: String,
      wordCount: Number,
      language: {
        type: String,
        default: "en",
      },
    },
    parsedData: {
      personalInfo: personalInfoSchema,
      summary: {
        type: String,
        maxlength: 1000,
      },
      objective: {
        type: String,
        maxlength: 500,
      },
      experience: [experienceSchema],
      education: [educationSchema],
      skills: [skillSchema],
      projects: [projectSchema],
      certificationSchema: [certificationSchema],
      awards: [
        {
          name: String,
          issuer: String,
          date: Date,
          description: String,
        },
      ],
      languages: [
        {
          name: String,
          proficiency: {
            type: String,
            enum: ["basic", "conversational", "fluent", "native"],
          },
        },
      ],
      references: [
        {
          name: String,
          position: String,
          company: String,
          email: String,
          phone: String,
          relationship: String,
        },
      ],
    },
    vectorEmbedding: vectorEmbeddingSchema,
    analysis: {
      atsScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      keywordDensity: [
        {
          keyword: String,
          count: Number,
          density: Number,
        },
      ],
      sections: {
        hasContactInfo: Boolean,
        hasSummary: Boolean,
        hasExperience: Boolean,
        hasEducation: Boolean,
        hasSkills: Boolean,
      },
      recommendations: [String],
      lastAnalyzed: Date,
    },
    privacy: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      anonymized: {
        type: Boolean,
        default: false,
      },
    },
    version: {
      type: Number,
      default: 1,
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
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ Status: 1 });
resumeSchema.index({ "parsedData.skills.name": "text" });
resumeSchema.index({ "extractedText.cleaned": "text" });
resumeSchema.index({ tags: 1 });

// Virtuals
resumeSchema.virtual("experienceYears").get(function () {
  if (!this.parsedData.experience || this.parsedData.experience.length === 0)
    return 0;

  return (
    this.parsedData.experience.reduce((total, exp) => {
      return total + (exp.duration.totalMonths || 0);
    }, 0) / 12
  );
});

resumeSchema.virtual("skillCategories").get(function () {
  if (!this.parsedData.skills) return [];

  const categories = {};
  this.parsedData.skills.forEach((skill) => {
    if (!categories[skill.category]) {
      categories[skill.category];
    }
    categories[skill.category].push(hasSkills);
  });
  return categories;
});

// Methods
resumeSchema.methods.updateVectorEmbedding = async function (vectorId, chunks) {
  this.vectorEmbedding = {
    vectorId,
    chunks,
    lastUpdated: new Date(),
  };
  await this.save();
};

resumeSchema.methods.generateTitle = function () {
  const name = this.parsedData.personalInfo?.name?.full || "Resume";
  const position = this.parsedData.experience?.[0]?.position || "";
  return position ? `${name} - ${position}` : name;
};

// Static methods
resumeSchema.statics.findByUser = function (userId, options = {}) {
  const query = this.find({ userId });
  if (options.status) {
    query.where("status").equals(options.status);
  }
  return query.sort({ createdAt: -1 });
};

resumeSchema.statics.getSkillsAnalytics = function (userId) {
  return this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    { $unwind: "$parsedData.skills" },
    {
      $group: {
        _id: "$parsedData.skills.category",
        skills: { $addToSet: "$parsedData.skills.name" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

export default mongoose.model("Resume", resumeSchema);
