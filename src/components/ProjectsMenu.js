import React from "react";
import { Link } from "react-router-dom";

// Style
import "../styles/ProjectsMenu.css";

// Constants
import PROJECTS from "../projects";

const ProjectsMenu = () => {
    return (
        <ul className="projects-menu">
            {PROJECTS.map(({ id, title }, index) => (
                <li key={index}>
                    <Link to={id}>{title}</Link>
                </li>
            ))}
        </ul>
    );
};

export default ProjectsMenu;
