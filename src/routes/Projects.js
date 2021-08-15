import { Link, Route, Switch, useRouteMatch } from "react-router-dom";

import Project from "../components/Project";
import "../styles/Projects.css";

function Projects() {
    let { path, url } = useRouteMatch();

    return (
        <div className="projects-container" >
            <h1 className="page-title" >Projects</h1>
            <Link to={`${url}/project1`} >Project 1</Link>
            <Link to={`${url}/project2`} >Project 2</Link>

            <Switch>
                <Route exact path={`${path}/:projectID`} >
                    <Project />
                </Route>
            </Switch>
        </div>
    );
};

export default Projects;
