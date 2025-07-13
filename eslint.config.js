import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
      ignores: ["dist", "coverage", "node_modules"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    eslintPluginPrettier,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
      },
      rules: {
        "prettier/prettier": ["error", { endOfLine: "auto" }],
        // "@typescript-eslint/no-explicit-any": "off",
      },
    }
);