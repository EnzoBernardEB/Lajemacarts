const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "lajemacarts",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "lajemacarts",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/component-max-inline-declarations": "error",
      "@angular-eslint/no-developer-preview": "error",
      "@angular-eslint/no-experimental": "error",
      "@angular-eslint/no-lifecycle-hook-call": "error",
      "@angular-eslint/sort-lifecycle-methods": "error",
      "@angular-eslint/directive-class-suffix": "error",
      "@angular-eslint/prefer-signals": "error",
      "@angular-eslint/use-injectable-provided-in": "error",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
