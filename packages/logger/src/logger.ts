export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export class Logger {
  constructor(
    private readonly context: string = "",
    private readonly enabled: boolean = true
  ) {}

  private formatLog(
    _strings: TemplateStringsArray,
    level: LogLevel,
    message: unknown
  ): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const levelStr = this.colorize(level);
    return `[${timestamp}] [${levelStr}] [${this.context}]: ${this.colorize(
      level,
      message
    )}`;
  }

  private colorize(level: LogLevel, value?: unknown): string {
    let text = value ?? level.toUpperCase();
    switch (level) {
      case LogLevel.DEBUG:
        return `\x1b[34m${text}\x1b[0m`; // Blue
      case LogLevel.INFO:
        return `\x1b[32m${text}\x1b[0m`; // Green
      case LogLevel.WARN:
        return `\x1b[33m${text}\x1b[0m`; // Yellow
      case LogLevel.ERROR:
        return `\x1b[31m${text}\x1b[0m`; // Red
      default:
        return text as string;
    }
  }

  debug(message: unknown, ...args: unknown[]) {
    if (!this.enabled) return;
    console.debug(this.formatLog`${LogLevel.DEBUG} ${message}`, ...args);
  }

  info(message: unknown, ...args: unknown[]) {
    if (!this.enabled) return;
    console.info(this.formatLog`${LogLevel.INFO} ${message}`, ...args);
  }

  warn(message: unknown, ...args: unknown[]) {
    if (!this.enabled) return;
    console.warn(this.formatLog`${LogLevel.WARN} ${message}`, ...args);
  }

  error(message: unknown, ...args: unknown[]) {
    if (!this.enabled) return;
    console.error(this.formatLog`${LogLevel.ERROR} ${message}`, ...args);
  }
}
