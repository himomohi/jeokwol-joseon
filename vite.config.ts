import { defineConfig } from "vite";

export default defineConfig({
  base: "/jeokwol-joseon/",
  server: {
    host: true,
    port: 47261,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 47261,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
