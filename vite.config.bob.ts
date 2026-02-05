import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite config for Bet on B.U.D. app
export default defineConfig({
  base: "/bet-on-bud/",
  build: {
    outDir: "dist-bob",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index-bob.html"),
      },
    },
  },
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
