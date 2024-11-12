import { Logger } from "./logger";

describe("Logger", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger("test");
    vitest.spyOn(console, "debug").mockImplementation(vitest.fn());
    vitest.spyOn(console, "info").mockImplementation(vitest.fn());
    vitest.spyOn(console, "warn").mockImplementation(vitest.fn());
    vitest.spyOn(console, "error").mockImplementation(vitest.fn());
    vitest.setSystemTime("2024-01-01T00:00:00.000Z");
  });

  it("logs debug messages", () => {
    logger.debug("debug message");
    expect(console.debug).toHaveBeenCalledWith(
      "[2024-01-01 00:00:00] [\x1b[34mDEBUG\x1b[0m] [test]: \x1b[34mdebug message\x1b[0m"
    );
  });

  it("logs info messages", () => {
    logger.info("info message");
    expect(console.info).toHaveBeenCalledWith(
      "[2024-01-01 00:00:00] [\x1b[32mINFO\x1b[0m] [test]: \x1b[32minfo message\x1b[0m"
    );
  });

  it("logs warn messages", () => {
    logger.warn("warn message");
    expect(console.warn).toHaveBeenCalledWith(
      "[2024-01-01 00:00:00] [\x1b[33mWARN\x1b[0m] [test]: \x1b[33mwarn message\x1b[0m"
    );
  });

  it("logs error messages", () => {
    logger.error("error message");
    expect(console.error).toHaveBeenCalledWith(
      "[2024-01-01 00:00:00] [\x1b[31mERROR\x1b[0m] [test]: \x1b[31merror message\x1b[0m"
    );
  });

  describe("when disabled", () => {
    const disabledLogger = new Logger("test", false);

    it("does not log anything", () => {
      disabledLogger.info("info message");
      expect(console.info).not.toHaveBeenCalled();
    });

    it("logs debug messages", () => {
      disabledLogger.debug("debug message");
      expect(console.debug).not.toHaveBeenCalled();
    });

    it("logs warn messages", () => {
      disabledLogger.warn("warn message");
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("logs error messages", () => {
      disabledLogger.error("error message");
      expect(console.error).not.toHaveBeenCalled();
    });

    it("logs with custom message", () => {
      disabledLogger.info("info message", "custom message");
      expect(console.info).not.toHaveBeenCalled();
    });
  });
});
