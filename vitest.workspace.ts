import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/mail/vite.config.ts",
  "./e2e/mail/vite.config.ts",
  "./packages/logger/vite.config.ts",
  "./e2e/templ/vite.config.ts",
  "./packages/nest/vite.config.ts",
]);
