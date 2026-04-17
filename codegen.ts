import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    "https://ziona-api-staging.onrender.com/graphql/": {
      headers: {
        "Content-Type": "application/json",
      },
    },
  },
  documents: ["services/graphQL/**/*.ts", "hooks/**/*.ts", "repository/**/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./src/types/__generated__/graphql.ts": {
      plugins: ["typescript", "typescript-operations"],
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
        },
        defaultScalarType: "unknown",
        nonOptionalTypename: true,
        skipTypenameForRoot: true,
      },
    },
  },
};

export default config;