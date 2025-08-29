class ApiResponse {
  static success(data, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message, errors = null) {
    return {
      success: false,
      message,
      ...(errors && { errors }),
    };
  }

  static paginated(data, pagination, message = "Success") {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  static created(data, message = "Created successfully") {
    return {
      success: true,
      message,
      data,
    };
  }
  static updated(data, message = "Updated successfully") {
    return {
      success: true,
      message,
      data,
    };
  }
  static deleted(message = "Deleted successfully") {
    return {
      success: true,
      message,
    };
  }
}

class ValidationError extends Error {
  constructor(message, errors = null) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = 403;
  }
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
export {
  ApiResponse,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  AppError,
};
