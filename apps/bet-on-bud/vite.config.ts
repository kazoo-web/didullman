import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite config for Bet on B.U.D. app
export default defineConfig({
  base: "/bet-on-bud/",
  root: __dirname,
  build: {
    outDir: "../../dist-bob",
    emptyOutDir: true,
  },
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../shared"),
    },
  },
});
