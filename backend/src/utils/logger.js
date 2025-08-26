// logger.js

class Logger {
  static colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
  };

  static info(message) {
    console.log(`${this.colors.blue}[INFO]${this.colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${this.colors.green}[SUCCESS]${this.colors.reset} ${message}`);
  }

  static warn(message) {
    console.log(`${this.colors.yellow}[WARN]${this.colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${this.colors.red}[ERROR]${this.colors.reset} ${message}`);
  }
}

export default Logger;
