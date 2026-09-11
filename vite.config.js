import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["jspdf", "jspdf-autotable"],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "https://backend-thundersafe.onrender.com/api",
    ),
  },
});
