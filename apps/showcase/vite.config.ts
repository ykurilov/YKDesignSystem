import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const reactPackage = (path: string) => fileURLToPath(new URL(`../../packages/react/src/${path}`, import.meta.url));

// Витрина берёт компоненты из исходников: правка в пакете видна сразу, без сборки
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@ykurilov/ds-react/styles.css", replacement: reactPackage("styles.css") },
      { find: /^@ykurilov\/ds-react$/, replacement: reactPackage("index.ts") },
    ],
  },
});
