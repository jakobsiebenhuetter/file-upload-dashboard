import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
      ignores: ["jest.config.js", "*"],
  },
  {    
      files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
      plugins: { js },
      extends: ["js/recommended"],
      languageOptions: { globals: globals.browser},
  },
    tseslint.configs.recommended,
  {
      rules: {
			  "no-unused-vars": "warn",
			  "no-undef": "warn",
        "semi": ["error", "always"],
        "quotes": ["error", "single"],
        "newline-after-var": ["error", "always"],
        "no-console": "off",
        "no-magic-numbers": "off",
        "function-call-argument-newline": "off",
      },
  }
]);
