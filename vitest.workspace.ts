import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./packages/mail/vite.config.ts",
  "./tests/mail/vite.config.ts",
  "./packages/logger/vite.config.ts",
  "./tests/templ/vite.config.ts"
])
