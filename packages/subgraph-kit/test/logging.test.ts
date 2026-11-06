import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";
import { createErrorMask } from "../src/errors.ts";
import { createLogger, createRequestScope } from "../src/logging.ts";

const capture = () => {
  const lines: string[] = [];
  return {
    lines,
    logger: createLogger("test", "info", { write: (l: string) => void lines.push(l) }),
  };
};

describe("createRequestScope", () => {
  it("[FR-OB-6] gives the request's logger inside a request, and the fallback outside", () => {
    const fallback = capture().logger;
    const inside = capture().logger;
    const scope = createRequestScope(fallback);

    expect(scope.run(inside, () => scope.current())).toBe(inside);
    expect(scope.current()).toBe(fallback);
  });
});

describe("createLogger", () => {
  it("[GR-4] keeps only an error's name, however subgraph code logs it", () => {
    const { lines, logger } = capture();

    logger.error({ err: new TypeError("private message") }, "failed");

    expect(lines.join()).toContain("TypeError");
    expect(lines.join()).not.toContain("private message");
  });

  it.each(["authorization", "token", "variables", "email", "headers", "query"])(
    "[GR-4] drops a field called %s",
    (field) => {
      const { lines, logger } = capture();

      logger.info({ [field]: "private-value", safe: "kept" }, "event");

      expect(lines.join()).not.toContain("private-value");
      expect(lines.join()).toContain("kept");
    },
  );
});

describe("createErrorMask", () => {
  it("[GR-4] masks an error with no original cause or path, and logs no message", () => {
    const { lines, logger } = capture();

    const masked = createErrorMask(() => logger)(new Error("private"), "Unexpected error.", false);

    expect(masked).toMatchObject({ message: "Unexpected error." });
    expect(lines.join()).toContain("resolver failed");
    expect(lines.join()).not.toContain("private");
  });

  it("[FR-SG-7] leaves a deliberate error alone, and logs nothing", () => {
    const { lines, logger } = capture();
    const error = new GraphQLError("Expected");

    expect(createErrorMask(() => logger)(error, "Unexpected error.", false)).toBe(error);
    expect(lines).toEqual([]);
  });
});
