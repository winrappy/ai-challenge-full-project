import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig, globalIgnores } from "eslint/config"

const baseParserOptions = {
  ecmaVersion: "latest",
  ecmaFeatures: { jsx: true },
  sourceType: "module",
}

const baseGlobals = {
  ...globals.browser,
}

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: baseGlobals,
      parserOptions: baseParserOptions,
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },

  {
    files: [
      "**/*.test.{js,jsx}",
      "**/__mock__/**/*.{js,jsx}",
      "**/__tests__/**/*.{js,jsx}",
      "jest.setup.js",
    ],
    env: {
      jest: true,
      global: true,
    },
    languageOptions: {
      globals: {
        ...baseGlobals,
        ...globals.jest,
        ...globals.node,
      },
      parserOptions: baseParserOptions,
    },
  },
])
