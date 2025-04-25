const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
    
  // Foreground colors
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
    
  // Background colors
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  }
};

class Logger {
  static _logWithColor(message, color, level) {
    const lines = message.split('\n');
    lines.forEach(line => {
      console.log(`${colors.fg[color]}[${level}]${colors.reset} ${line}`);
    });
  }

  static info(message) {
    this._logWithColor(message, 'cyan', 'INFO');
  }

  static success(message) {
    this._logWithColor(message, 'green', 'SUCCESS');
  }

  static warning(message) {
    this._logWithColor(message, 'yellow', 'WARNING');
  }

  static error(message) {
    this._logWithColor(message, 'red', 'ERROR');
  }

  static debug(message) {
    this._logWithColor(message, 'magenta', 'DEBUG');
  }

  static api(message) {
    this._logWithColor(message, 'blue', 'API');
  }

  static database(message) {
    this._logWithColor(message, 'cyan', 'DATABASE');
  }

  static custom(label, message, color = 'white') {
    const lines = message.split('\n');
    lines.forEach(line => {
      console.log(`${colors.fg[color]}[${label.toUpperCase()}]${colors.reset} ${line}`);
    });
  }
}

module.exports = Logger; 