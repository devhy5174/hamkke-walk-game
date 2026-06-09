import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 스플래시 최소 1.2초 노출 후 페이드 아웃
const splash = document.getElementById("splash");
if (splash) {
  const mountedAt = performance.now();
  const MIN_SHOW = 1200;
  const doHide = () => {
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 380);
  };
  const elapsed = performance.now() - mountedAt;
  const remaining = MIN_SHOW - elapsed;
  if (remaining > 0) setTimeout(doHide, remaining);
  else doHide();
}
