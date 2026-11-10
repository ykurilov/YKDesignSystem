import { defineConfig } from "tsup";

const common = { format: ["esm" as const], target: "es2022", sourcemap: true, external: ["react", "react-dom", "@phosphor-icons/react"] };

// JS и общий styles.css; объявления типов строит tsc (см. скрипт build)
export default defineConfig([
  {
    ...common,
    entry: { index: "src/index.ts", styles: "src/styles.css" },
    clean: true,
    // Компоненты с хуками: Next.js App Router должен считать их клиентскими
    banner: { js: '"use client";' },
  },
  {
    // Серверно-безопасный подпуть: без React и без "use client" (themeScript в серверном layout)
    ...common,
    entry: { "theme-script": "src/theme/themeScript.ts" },
    clean: false,
  },
]);
