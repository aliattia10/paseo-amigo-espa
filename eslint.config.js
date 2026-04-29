import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "supabase/**",
      "kyc_service/**",
      "src/integrations/supabase/types.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}", "vite.config.ts", "tailwind.config.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Off: many intentional dependency omissions (contexts, one-shot effects); enable per-file if desired
      "react-hooks/exhaustive-deps": "off",
      // Off: shadcn/ui + contexts export hooks/helpers alongside components
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // ESLint 9 + typescript-eslint: extension can throw (allowShortCircuit); use core rule if needed later
      "@typescript-eslint/no-unused-expressions": "off",
      // Large legacy surface; tighten gradually or fix per-file
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
