import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";
import "./showcase.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
