import React from "react";
import { Outlet } from "react-router-dom";

// Styles
import "../../styles/Projects.css";

const Projects = () => {
    return (
        <div className="projects-container">
            <Outlet />
        </div>
    );
};

export default Projects;
