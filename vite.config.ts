import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

const path = require("path");
function _resolve(dir: string) {
  return path.resolve(__dirname, dir);
}

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/" : "./",
  define: {
    "process.env": process.env,
  },
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        {
          "@/store": ["useStore"],
        },
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
    }),
  ],
  alias: {
    "@": _resolve("src"),
    "@assets": _resolve("src/assets"),
    "@comps": _resolve("src/components"),
    "@utils": _resolve("src/utils"),
    "@router": _resolve("src/router"),
    "@store": _resolve("src/store"),
  },
});
