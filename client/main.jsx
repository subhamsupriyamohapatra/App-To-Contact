import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Toaster position="top-right" />
    <App />
  </>
);