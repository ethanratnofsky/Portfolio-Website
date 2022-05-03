import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import reportWebVitals from "./reportWebVitals";
import LoadingOverlay from "./components/LoadingOverlay";
import Navbar from "./components/Navbar";
import Message from "./components/Message";
import Home from "./routes/Home";
import Projects from "./routes/Projects";
// import Experience from "./routes/Experience";
import Gallery from "./routes/Gallery";
// import Resume from "./routes/Resume";

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
        <div className={"content" + (showMobileView ? " mobile" : "")} >
            <LoadingOverlay />

            <Navbar />
            
            <div className="page-content" >
                <Switch>
                    <Route path="/projects" >
                        <Projects />
                    </Route>
                    <Route exact path="/experience" >
                        <Redirect to="/coming-soon" />
                        {/* TODO: 
                        <Experience /> */}
                    </Route>
                    <Route path="/gallery" >
                        <Gallery />
                    </Route>
                    <Route path="/resume" >
                        <Redirect to="/coming-soon" />
                        {/* TODO: 
                        <Resume /> */}
                    </Route>
                    <Route exact path="/coming-soon" >
                        <Message message="Coming Soon! 🥳" submessage="Woah! You're here a little early...check back in a bit - this content is in development!" />
                    </Route>
                    <Route exact path="/" >
                        <Home />
                    </Route>
                    <Route>
                        <Message message="⚠️ 404 Page Not Found" submessage={<>Hmm...it seems like this page doesn't exist. Go back to <a href="/" rel="noreferrer" >safety</a>!</>} />
                    </Route>
                </Switch>
            </div>
        </div>
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
