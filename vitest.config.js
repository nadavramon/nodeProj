import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Exclude the manual integration trigger from automated runs
    exclude: ["src/__test__/scheduler/test-trigger.test.js", "**/node_modules/**"],
  },
});
