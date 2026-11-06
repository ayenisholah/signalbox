import type { FieldNode, GraphQLError } from "graphql";
import { maskError } from "graphql-yoga";
import type { Logger } from "./logging.ts";

type MaskError = typeof maskError;

/**
 * Logs a type name and a field name only. An error's message can quote upstream responses or
 * variables, and a path holds the client's aliases (GR-4). Development mode is always off, because
 * it would send the stack to clients if `NODE_ENV` were ever wrong.
 */
export const createErrorMask =
  (logger: () => Logger): MaskError =>
  (error, message) => {
    const masked = maskError(error, message, false);
    if (masked !== error) {
      const { originalError, nodes } = error as Partial<GraphQLError>;
      const field = (nodes?.[0] as FieldNode | undefined)?.name.value;
      logger().error({ error: originalError?.name, field }, "resolver failed");
    }
    return masked;
  };
