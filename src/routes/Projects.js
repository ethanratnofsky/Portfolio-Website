import { useState } from "react";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";

import Project from "../components/Project";
import "../styles/Projects.css";

function Projects() {
    const [showingProject, setShowingProject] = useState(false);

    let { path, url } = useRouteMatch();

    return (
        <div className="projects-container" >
            <ul className={"projects-menu" + (showingProject ? " hidden" : "")} >
                <li><Link to={`${url}/playlist-bridge`} >Playlist Bridge</Link></li>
                <li><Link to={`${url}/project2`} >Project 2</Link></li>
                <li><Link to={`${url}/project3`} >Project 3</Link></li>
                <li><Link to={`${url}/project4`} >Project 4</Link></li>
                <li><Link to={`${url}/project5`} >Project 5</Link></li>
            </ul>

            <Switch>
                <Route exact path={`${path}/:projectID`} >
                    <Project setShowingProject={setShowingProject} />
                </Route>
            </Switch>
        </div>
    );
};

export default Projects;
