import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import WebsiteMetadata from "./components/WebsiteMetadata";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WebsiteMetadata />
    <App />
  </React.StrictMode>
);
