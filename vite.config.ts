import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/newportfolio/", // set to "/<your-repo>/" for GitHub Pages
});
