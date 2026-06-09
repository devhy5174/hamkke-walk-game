import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// React 마운트 완료 후 스플래시 페이드 아웃
const splash = document.getElementById("splash");
if (splash) {
  splash.classList.add("hide");
  setTimeout(() => splash.remove(), 380);
}
