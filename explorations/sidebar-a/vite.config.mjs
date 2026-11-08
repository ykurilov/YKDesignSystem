import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// Зависимости витрины уже установлены: у референса нет второй копии React.
const require = createRequire(new URL("../../apps/showcase/package.json", import.meta.url));
const { defineConfig } = await import(pathToFileURL(require.resolve("vite")).href);
const { default: react } = await import(pathToFileURL(require.resolve("@vitejs/plugin-react")).href);
const root = fileURLToPath(new URL("../../", import.meta.url));
export default defineConfig({
  plugins: [react()],
  resolve: { alias: [
    { find: "@ykurilov/ds-react/styles.css", replacement: `${root}packages/react/src/styles.css` },
    { find: "@ykurilov/ds-react", replacement: `${root}packages/react/src/index.ts` },
    { find: "@ykurilov/ds-tokens/tokens.css", replacement: `${root}packages/tokens/dist/tokens.css` },
    { find: "react-dom", replacement: dirname(require.resolve("react-dom/package.json")) },
    { find: "react", replacement: dirname(require.resolve("react/package.json")) },
    { find: "@phosphor-icons/react", replacement: dirname(require.resolve("@phosphor-icons/react/package.json")) },
  ] },
  server: { strictPort: true, fs: { allow: [root] } },
});
