import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { applyTheme, readThemeSettings, resolveDark, systemPrefersDark } from "./utils/theme";

// Áp chủ đề đã lưu trước lần vẽ đầu tiên (chỉ khi đã đăng nhập — màn đăng nhập giữ giao diện gốc)
try {
  if (localStorage.getItem("kpi.session") ?? sessionStorage.getItem("kpi.session")) {
    const settings = readThemeSettings();
    applyTheme(settings, resolveDark(settings, systemPrefersDark()));
  }
} catch {

  /* không đọc được lưu trữ: để ThemeProvider áp sau */}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}