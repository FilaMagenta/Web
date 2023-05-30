class LogLevel {
    /**
     * Builds a new log level.
     * @param {string} color
     * @param {string} prefix
     */
    constructor(color, prefix) {
        this.color = color;
        this.prefix = prefix;
        this.foreground = getColorBrightness(color) >= 7 ? 'black' : 'white';
    }

    /**
     * The foreground color that identifies the log level in the log messages.
     * @type {string}
     */
    color;

    /**
     * The color to use over color. White or black.
     * @type {string}
     */
    foreground;

    /**
     * The text to append before the log message.
     * @type {string}
     */
    prefix;
}

const DEBUG = new LogLevel('#29728e', 'D');
const INFO = new LogLevel('#298619', 'I');
const ERROR = new LogLevel('#ad041f', 'E');

function getColorBrightness(color) {
    const r = parseInt(color.substring(1, 2), 16);
    const g = parseInt(color.substring(3, 4), 16);
    const b = parseInt(color.substring(5, 6), 16);
    return (r + g + b) / 3;
}

class Logger {
    /**
     * Creates a new logger that identifies with the given key.
     * @param {string} key The key for identifying the logger in the debug info.
     * @param {string} color The color to use for identifying the logger's tag.
     */
    constructor(key, color) {
        this.key = key.substring(0, 16).toUpperCase();
        this.color = color;
        this.foreground = getColorBrightness(color) >= 7 ? 'black' : 'white';
    }

    /**
     * The key to use in the log messages.
     * @type {string}
     */
    key;

    /**
     * The color to use for identifying the logger's tag.
     * @type {string}
     */
    color;

    /**
     * The color to use over color. White or black.
     * @type {string}
     */
    foreground;

    /**
     * Prints the given message in the log level desired.
     * @param {LogLevel} level The log level to use.
     * @param message The message to be printed.
     */
    print(level, ...message) {
        const key = this.key.padEnd(16, ' ');
        const msg = message.join(' ');

        console.log(
            `%c${key}%c${level.prefix}%c ${msg}`,
            `background: ${this.color}; color: ${this.foreground}; padding: 4px 12px`,
            `background: ${level.color}; color: ${level.foreground}; padding: 4px 8px`,
            `color: ${level.color}`
        );
    }

    log(...message) {
        this.print(DEBUG, ...message);
    }

    info(...message) {
        this.print(INFO, ...message);
    }

    error(...message) {
        this.print(ERROR, ...message);
    }
}
