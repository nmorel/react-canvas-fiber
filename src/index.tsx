import React from "react";
import { App } from "./App";
import "./app.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Container not found");
}
const root = createRoot(container);
root.render(<App />);
