/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./app/setupTests.ts",
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
    css: true,
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
