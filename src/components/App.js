import React, { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";

// Components
import LoadingOverlay from "./LoadingOverlay";
import Message from "./Message";
import Navbar from "./Navbar";
import Project from "./Project";
import ProjectsMenu from "./ProjectsMenu";

// Routes
import Home from "./routes/Home";
import Projects from "./routes/Projects";
import Experience from "./routes/Experience";
import Gallery from "./routes/Gallery";

// Styles
import "../styles/animations.css";
import "../styles/App.css";

// The maximum number of pixels the window must be to be determined as mobile view
const MOBILE_VIEW_THRESHOLD = 890;

const App = () => {
    // Determine if the window is mobile view
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showMobileView, setShowMobileView] = useState(null);

    // Set up event listeners
    useEffect(() => {
        // Blur active element on click
        const handleClick = () => document.activeElement.blur();
        document.addEventListener("click", handleClick);

        // Window resize event listener
        const handleWindowResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleWindowResize);

        // Hash change event listener
        const handleHashChange = () => {
            const { hash, pathname } = window.location;

            // If the URL is not the root, redirect to the root
            if (pathname !== "/") {
                window.location.href = "/#" + pathname;
            }

            // Fix URL if slash exists in hash and is not the first character
            const hashSlashIndex = hash.indexOf("/");
            if (hashSlashIndex > -1 && hashSlashIndex !== 1) {
                window.location.href = "/#" + hash.slice(hashSlashIndex);
            }
        };
        window.addEventListener("hashchange", handleHashChange);
        handleHashChange();

        // Cleanup event listeners
        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("resize", handleWindowResize);
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []); // Only run on mount

    // Determine if window is narrow enough to be identified as mobile view
    useEffect(() => {
        setShowMobileView(windowWidth <= MOBILE_VIEW_THRESHOLD);
    }, [windowWidth]);

    return (
        <div className={`app-container${showMobileView ? " mobile" : ""}`}>
            <LoadingOverlay />
            <Navbar />
            <div className="page-content">
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="projects" element={<Projects />}>
                        <Route path=":projectID" element={<Project />} />
                        <Route index element={<ProjectsMenu />} />
                    </Route>
                    <Route path="experience" element={<Experience />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route
                        path="coming-soon"
                        element={
                            <Message
                                message="Coming Soon! 🥳"
                                submessage={
                                    "Woah! You're here a little early...check back in a bit - this content is in development!"
                                }
                            />
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Message
                                message="⚠️ 404 Page Not Found"
                                submessage={
                                    <>
                                        Hmm...it seems like this page doesn't
                                        exist. Go back to{" "}
                                        <Link to="/" rel="noreferrer">
                                            safety
                                        </Link>
                                        !
                                    </>
                                }
                            />
                        }
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;
