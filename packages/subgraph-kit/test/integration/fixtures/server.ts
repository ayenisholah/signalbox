import { GraphQLError } from "graphql";
import { createSubgraph } from "../../../src/index.ts";

const subgraph = createSubgraph({
  name: "fixture",
  typeDefs: "type Query { refuses: String fails: String }",
  resolvers: {
    Query: {
      refuses: () => {
        throw new GraphQLError("Source unavailable", {
          extensions: { code: "UPSTREAM_UNAVAILABLE" },
        });
      },
      fails: () => {
        throw new Error("private detail");
      },
    },
  },
});

await subgraph.listen();
