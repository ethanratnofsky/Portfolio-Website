import ProjectTile from "../components/ProjectTile"

import "../styles/Projects.css"

function Projects() {
    return (
        <div className="projects" >
            <h1 className="page-title" >Projects</h1>
            <div className="tiles-container" >
                <ProjectTile title="Title" description="Description" deliverables="" year="2021" link="https://google.com" />
                <ProjectTile title="Title" description="Description" deliverables="" year="2021" link="https://google.com" />
                <ProjectTile title="Title" description="Description" deliverables="" year="2021" link="https://google.com" />
                <ProjectTile title="Title" description="Description" deliverables="" year="2021" link="https://google.com" />
                <ProjectTile title="Title" description="Description" deliverables="" year="2021" link="https://google.com" />
            </div>
        </div>
    )
};

export default Projects;
