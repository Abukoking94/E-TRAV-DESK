import { MotionConfig } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryProvider } from "./app/providers/QueryProvider";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
