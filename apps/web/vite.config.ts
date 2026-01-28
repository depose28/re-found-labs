import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Optional: lovable-tagger for development (only if using Lovable.dev)
let componentTagger: any;
try {
  componentTagger = require("lovable-tagger").componentTagger;
} catch {
  // lovable-tagger not installed, skip it
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
