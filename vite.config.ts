import { defineConfig } from 'vitest/config';
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
          "~": resolve(__dirname, "./app")
        }
      },
    test: {
        globals: true,
        setupFiles: ["./test/setup-test-env.ts"],
        include: ["./test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: ["build", "node_modules", "public"],
        watchExclude: [
            ".*\\/node_modules\\/.*",
            ".*\\/build\\/.*",
        ],
        coverage: {
            all: true,
            exclude: ["build", "node_modules", "public", "test"],
            include: ["app"],
            reporter: ["text", "json"]
        }
    },
})