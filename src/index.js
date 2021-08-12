import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import reportWebVitals from "./reportWebVitals";
import LoadingOverlay from "./components/LoadingOverlay";
import Navbar from "./components/Navbar";

import Home from "./routes/Home";
import Projects from "./routes/Projects";
import Experience from "./routes/Experience";
import GraphicDesign from "./routes/GraphicDesign";
import Photography from "./routes/Photography";

import "./styles/index.css";
import "./styles/animations.css";

const mobileWidthThreshold = 890; // The maximum number of pixels the window must be to be determined as mobile view

function App() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showMobileView, setShowMobileView] = useState(null);

    // Handle window resize
    useEffect(() => {
        function handleWindowResize() {
                setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleWindowResize);
        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []); // Empty array ensures that effect is only run on mount

    // Determine if window is narrow enough to be identified as mobile view
    useEffect(() => {
        setShowMobileView(windowWidth <= mobileWidthThreshold);
    }, [windowWidth]);

    return (
        <>
            <LoadingOverlay />
            <Navbar showMobileView={showMobileView} />
            
            <div className={"content" + (showMobileView ? " mobile" : "")} >
                <Switch>
                    <Route exact path="/projects" >
                        <Projects />
                    </Route>
                    <Route exact path="/experience" >
                        <Experience />
                    </Route>
                    <Route exact path="/graphic-design" >
                        <GraphicDesign />
                    </Route>
                    <Route exact path="/photography" >
                        <Photography />
                    </Route>
                    <Route exact path="/" >
                        <Home />
                    </Route>
                </Switch>
            </div>
        </>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
