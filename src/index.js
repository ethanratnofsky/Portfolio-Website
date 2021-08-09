import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import reportWebVitals from "./reportWebVitals";
import Greeting from "./components/Greeting";
import Navbar from "./components/Navbar";

import Projects from "./routes/Projects";
import Experience from "./routes/Experience";
import GraphicDesign from "./routes/GraphicDesign";
import Photography from "./routes/Photography";
import About from "./routes/About";
import ContactMe from "./routes/ContactMe";
import Home from "./routes/Home";

import "./styles/index.css";
import "./styles/animations.css";

const mobileWidthThreshold = 890; // The maximum number of pixels the window must be to be determined as mobile view

function App() {
    const [showGreeting, setShowGreeting] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showMobileView, setShowMobileView] = useState(null);

    const handleOnFinished = () => {
        setShowGreeting(false);
    };

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

    return (showGreeting ? <Greeting onFinished={handleOnFinished} /> :
        <>
            <Navbar showMobileView={showMobileView} />
            
            <div className={"content" + (showMobileView ? " mobile" : "")} >
                <Switch>
                    <Route path="/projects" >
                        <Projects />
                    </Route>
                    <Route path="/experience" >
                        <Experience />
                    </Route>
                    <Route path="/graphic-design" >
                        <GraphicDesign />
                    </Route>
                    <Route path="/photography" >
                        <Photography />
                    </Route>
                    <Route path="/about" >
                        <About />
                    </Route>
                    <Route path="/contact-me" >
                        <ContactMe />
                    </Route>
                    <Route path="/" >
                        <Home showMobileView={showMobileView} />
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
