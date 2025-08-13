import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// Helpful: `npm i -D rollup-plugin-visualizer`
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
      open: false, // set true if you want it to auto-open after build
    }),
  ],
  base: "/", // custom domain = root
  build: {
    // keep the warning honest; you should see it drop below 500 after changes
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // put each dependency from node_modules into its own "vendor-*" chunk
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const after = id.split("node_modules/")[1];
            const parts = after.split("/");
            // support scoped packages like @firebase/app
            const lib = parts[0].startsWith("@")
              ? `${parts[0]}-${parts[1]}`
              : parts[0];
            return `vendor-${lib.replace("@", "").replace("/", "-")}`;
          }
        },
      },
    },
  },
});
