import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

// Components
import App from "./components/App";
import Snowflakes from "./components/Snowflakes";
import LoadingOverlay from "./components/LoadingOverlay";

// Mount app
const root = createRoot(document.getElementById("app"));
root.render(
    <HashRouter>
        <LoadingOverlay />
        {
            // Only show snowflakes in December
            new Date().getMonth() == 11 && <Snowflakes />
        }
        <App />
    </HashRouter>
);
