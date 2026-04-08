import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repo = process.env.GITHUB_REPOSITORY || "";
const repoName = repo.includes("/") ? repo.split("/")[1] : "";
const inferredBase = repoName ? `/${repoName}/` : "/";
const basePath =
  process.env.BASE_PATH || process.env.VITE_BASE || inferredBase || "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
});
