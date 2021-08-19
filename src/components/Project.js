import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import "../styles/Project.css"

import { ReactComponent as GitHubIcon } from "../images/github.svg"
import { ReactComponent as ExternalLinkIcon } from "../images/external_link.svg"
import PlaylistBridgeImage from "../images/playlist_bridge.png"

function Project({ setShowingProject }) {
    const backButtonElement = (
        <div className="back-button" >
            <Link to="/projects" >
                <div className="arrow" >{"\u2190"}</div>
                Back to Projects
            </Link>
        </div>
    );

    useEffect(() => {
        setShowingProject(true);
        return () => {
            setShowingProject(false);
        }
    }, [setShowingProject]);

    let title = "No Project Title";
    let year = "Unknown";
    let description = "No description given.";
    let skills = ["None"];
    let github = false;
    let link = false;
    let imgSrc = false;

    let { projectID } = useParams();
    switch (projectID) {
        case "playlist-bridge":
            title = "Playlist Bridge";
            year = "2020";
            description = <>
                <i>Playlist Bridge</i> is a web application which was built to convert music playlists from one streaming service to another.
                The development of the web application was inspired by a request from one of my good friends to share my music playlist with him.
                However, said friend streamed music on <a href="https://www.apple.com/apple-music/" target="_blank" rel="noreferrer" >Apple Music</a> and my playlist was created on <a href="https://tidal.com/" target="_blank" rel="noreferrer" >TIDAL</a>.
                Since we did not use the same music streaming service, we were not able to easily share music with one another.
                Also motivated by my then recent aquisition of beginner web development skills from my <u>internship in the summer of 2020</u>, I decided to start the construction of a web application that would handle bridging the gap between music streaming services.
                Enter <i>Playlist Bridge</i>.
            </>;
            skills = ["Python", "HTML", "CSS", "JavaScript", "REST API"];
            github = "https://github.com/ethanratnofsky/Playlist-Bridge"
            link = "https://playlistbridge.herokuapp.com";
            imgSrc = PlaylistBridgeImage;
            break;
        case "project2":
            title = "Insert Project Title";
            year = "YEAR";
            description = "Insert project description.";
            skills = ["Insert", "Skills", "Here"];
            link = "https://example.com";
            imgSrc = null;
            break;
        default:
            return (
                <div className="project-container not-found">
                    {backButtonElement}
                    <div className="message" >
                        <h1>404 Project Not Found</h1>
                        <p>Uh oh! Looks like this project doesn't exist...<i>yet</i>. 😉</p>
                    </div>
                </div>
            );
    };

    return (
        <div className="project-container" >
            {backButtonElement}
            <div className="project-header">
                <div>
                    <h1 className="project-title" >{title}</h1>
                    <div className="project-year" >{year}</div>
                </div>
                <ul className="project-links" >
                    {github ? <li><a className="icon-link" href={github} target="_blank" rel="noreferrer" ><GitHubIcon title={title + " | GitHub"} /></a></li> : null}
                    {link ? <li><a className="icon-link" href={link} target="_blank" rel="noreferrer" ><ExternalLinkIcon title={title} /></a></li> : null}
                </ul>
            </div>
            <div className="project-details" >
                <div className="project-description" >
                    <h4 className="label" >Description</h4>
                    {description}
                </div>
                <ul className="project-skills" >
                    <h4 className="label" >Skills</h4> 
                    {skills.map((skill, i) => <li className="project-skill" key={i} >{skill}</li>)}
                </ul>
            </div>
            {imgSrc ? <img className="project-image" src={imgSrc} alt={title} /> : <div className="project-image" />}
        </div>
    );
};

export default Project;
