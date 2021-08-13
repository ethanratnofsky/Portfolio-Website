import "../styles/ProjectTile.css"

function ProjectTile({ title, year, description, deliverables, link, imgSrc }) {
    return (
        <div className="project-tile" >
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

export default ProjectTile;
