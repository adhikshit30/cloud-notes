import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import SharedNote from "./shared.jsx";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/shared/:token", element: <SharedNote /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
