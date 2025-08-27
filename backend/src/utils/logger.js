// logger.js

const logger = {
  colors: {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
  },

  // Format log message
  format: (level, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  },

  // log with color
  log: (level, message) => {
    const color = logger.colors[level] || logger.colors.info;
    const formattedMessage = logger.format(level, message);
    const coloredMessage = `${color}${formattedMessage}${logger.colors.reset}`;

    switch (level) {
      case "error":
        console.error(coloredMessage);
        break;
      case "warn":
        console.warn(coloredMessage);
        break;
      case "debug":
        if (
          process.env.NODE_ENV === "development" ||
          process.env.NODE_ENV === "dev"
        ) {
          console.debug(coloredMessage);
        }
        break;
      default:
        console.log(coloredMessage);
    }
  },
  // Simple logging methods
  info: (message) => logger.log("info", message),
  error: (message) => logger.log("error", message),
  warn: (message) => logger.log("warn", message),
  debug: (message) => logger.log("debug", message),
  success: (message) => logger.log("success", message),
};
export default logger;
