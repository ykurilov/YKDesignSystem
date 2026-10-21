import { defineConfig } from "tsup";

// JS и общий styles.css; объявления типов строит tsc (см. скрипт build)
export default defineConfig({
  entry: { index: "src/index.ts", styles: "src/styles.css" },
  format: ["esm"],
  target: "es2022",
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@phosphor-icons/react"],
  // Компоненты с хуками: Next.js App Router должен считать их клиентскими
  banner: { js: '"use client";' },
});
