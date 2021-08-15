import { useParams } from "react-router-dom";

import "../styles/Project.css"

function Project() {
    let title = "Title";
    let year = "Year";
    let description = "Description";
    let deliverables = "Deliverables";
    let link = "https://google.com";
    let imgSrc = false;

    let { projectID } = useParams();
    switch (projectID) {
        case "project1":
            title = "Project 1";
            year = "2021";
            description = "This is a description.";
            deliverables = "HTML, CSS, JavaScript";
            link = "https://google.com";
            imgSrc = "";
            break;
        case "project2":
            title = "Project 2";
            year = "2000";
            description = "This is an ooooold project.";
            deliverables = "HTML, CSS, JavaScript";
            link = "https://google.com";
            imgSrc = "";
            break;
        default:
            return <h1>No Project Found.</h1>
    };

    return (
        <div className="project-container" >
            <div className="project-header" >
                <h2 className="project-title" >{title}</h2>
                <div className="project-year" >{year}</div>
            </div>
            <div className="project-description" ><b>Description:</b> {description}</div>
            <div className="project-deliverables" ><b>Deliverables:</b> {deliverables}</div>
            <div className="project-link" ><b>Link:</b> <a href={link} target="_blank" rel="noreferrer" >{link}</a></div>
            {imgSrc ? <img className="project-image" src={imgSrc} alt={title} /> : <div className="project-image" />}
        </div>
    );
}

export default Project;
