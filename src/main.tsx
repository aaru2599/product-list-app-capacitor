import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
} from "@capacitor-community/sqlite";
import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const platform = Capacitor.getPlatform();
    console.log("Platform:", platform);

    // WEB SPECIFIC FUNCTIONALITY
    if (platform === "web") {
      const sqlite = new SQLiteConnection(CapacitorSQLite);

      // Check if 'jeep-sqlite' is already defined
      if (!customElements.get("jeep-sqlite")) {
        // Create the 'jeep-sqlite' Stencil component
        customElements.define("jeep-sqlite", JeepSqlite);
        const jeepSqliteEl = document.createElement("jeep-sqlite");
        document.body.appendChild(jeepSqliteEl);
        await customElements.whenDefined("jeep-sqlite");
        console.log("After customElements.whenDefined");
      }

      // Wait until the 'jeep-sqlite' element is present in the DOM
      const checkJeepSqliteElement = () =>
        new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (document.querySelector("jeep-sqlite")) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

      await checkJeepSqliteElement();

      // Initialize the Web store
      await sqlite.initWebStore();
      console.log("After initWebStore");
    }

    const container = document.getElementById("root");
    if (!container) {
      throw new Error("Root container is missing.");
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App rendered successfully");
  } catch (e) {
    console.error("Error during initialization:", e);
  }
});
