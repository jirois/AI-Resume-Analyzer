import mongoose from "mongoose";

class ModelHelpers {
  // Generic pagination helper
  static async paginate(Model, query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = null,
      select = null,
    } = options;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Model.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .select(select)
        .lean(),
      Model.countDocuments(query),
    ]);
    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // Soft delete helper
  static applySoftDelete(schema) {
    schema.add({
      deleteAt: {
        type: Date,
        default: null,
      },
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    });
    schema.pre(/^find/, function () {
      if (!this.getOptions().includeDeleted) {
        this.where({ deletedAt: null });
      }
    });
    schema.methods.softDelete = function (deletedBy = null) {
      this.deleteAt = new Date();
      this.deletedBy = deletedBy;
      return this.save();
    };
    schema.method.restore = function () {
      this.deletedAt = null;
      this.deletedBy = null;
      return this.save();
    };
  }

  // Search helper with MongoDB text search
  static async textSearch(Model, searchTerm, options = {}) {
    const {
      filter = {},
      limit = 10,
      page = 1,
      sortBy = { score: { $meta: "textScore" } },
    } = options;
    const query = {
      $text: { $search: searchTerm },
      ...filter,
    };
    const projection = {
      score: { $meta: "textScore" },
      ...options.select,
    };
    return this.paginate(Model, query, {
      ...options,
      limit,
      page,
      sort: sortBy,
      select: projection,
    });
  }

  // Audit trail helper
  static applyAuditTrail(schema) {
    schema.add({
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    });
    schema.pre("save", function (next) {
      if (this.isNew && this.constructor._currentUser) {
        this.createdBy = this.constructor._currentUser;
      }
      if (this.constructor._currentUser) {
        this.updatedBy = this.constructor._currentUser;
      }
      next();
    });
  }

  // Set current user for audit trail
  static setCurrentUser(Model, userId) {
    Model._currentUser = userId;
  }
}

export default ModelHelpers;
