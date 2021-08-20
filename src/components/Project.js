import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Message from "../components/Message";

import "../styles/Project.css"

import { ReactComponent as GitHubIcon } from "../images/github.svg";
import { ReactComponent as ExternalLinkIcon } from "../images/external_link.svg";

import PlaylistBridgeImage from "../images/playlist_bridge.png";
import PortfolioWebsiteImage from "../images/portfolio_website.png";

function Project({ setShowingProject }) {
    const backButtonElement = (
        <div className="back-button" >
            <Link to="/projects" >
                <div className="arrow" >{"\u2190"}</div>
                Back to Projects
            </Link>
        </div>
    );

    // Control state for showing project menu vs. project
    useEffect(() => {
        setShowingProject(true);
        return () => {
            setShowingProject(false);
        };
    }, [setShowingProject]);

    // Default values for project information
    let title = "No Project Title";
    let year = "Unknown";
    let description = "No description given.";
    let skills = [];
    let github = false;
    let link = false;
    let imgSrc = false;
    let isWebsite = false;

    // Switch for determining project information to display
    let { projectID } = useParams();
    switch (projectID) {
        /*
        case "template":
            title = "TITLE";
            year = "YEAR";
            description = "DESCRIPTION";
            skills = ["SKILLS"];
            github = "https://github.com/ethanratnofsky/";
            link = "https://example.com";
            imgSrc = false;
            isWebsite = false;
            break;
        */
        case "portfolio-website":
            title = "Portfolio Website";
            year = "2021";
            description = <>
                You're lookin' at it! I built this website to showcase my skills and experience in a unique and creative way.
                In fact, the only external libraries that are used in this project are the JavaScript libraries <a href="https://reactjs.org/" target="_blank" rel="noreferrer" >React</a> and <a href="https://reactrouter.com/" target="_blank" rel="noreferrer" >React Router</a>.
                The React JavaScript library uses <a href="https://reactjs.org/docs/introducing-jsx.html" target="_blank" rel="noreferrer" >JavaScript XML (JSX)</a> for rendering document elements, so no template engine is required.
                And, yes, although it takes more time and effort, no CSS frameworks are in use - only pure custom CSS. 
                The benefits of using minimal external libraries/frameworks are greater control of design and deeper knowledge of programming concepts.
            </>;
            skills = ["Web Development", "HTML", "CSS", "JavaScript"];
            github = "https://github.com/ethanratnofsky/Portfolio-Website";
            link = "/";
            imgSrc = PortfolioWebsiteImage;
            isWebsite = true;
            break;
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
                This project uses a Python backend built on the <a href="https://flask.palletsprojects.com/en/2.0.x/" target="_blank" rel="noreferrer" >Flask</a> web framework.
                Consequently, the template engine <a href="https://jinja.palletsprojects.com/en/3.0.x/" target="_blank" rel="noreferrer" >Jinja2</a> and JavaScript library <a href="https://jquery.com/" target="_blank" rel="noreferrer" >jQuery</a> are also in use.
                The <a href="https://getbootstrap.com/docs/4.6/getting-started/introduction/" target="_blank" rel="noreferrer" >Bootstrap 4</a> CSS framework is used as a supplement to custom pure CSS for frontend styling.
            </>;
            skills = ["Web Development", "Python", "HTML", "CSS", "JavaScript", "REST API"];
            github = "https://github.com/ethanratnofsky/Playlist-Bridge";
            link = "https://playlistbridge.herokuapp.com";
            imgSrc = PlaylistBridgeImage;
            isWebsite = true;
            break;
        default:
            return (
                <div className="project-container">
                    {backButtonElement}
                    <Message message="⚠️ 404 Project Not Found" submessage={<>Uh oh! Looks like this project doesn't exist...<i>yet</i>. 😉</>} />
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
                    {skills.length !== 0 ? skills.map((skill, i) => <li className="project-skill" key={i} >{skill}</li>) : <li className="project-skill" >None</li>}
                </ul>
            </div>
            {imgSrc ? 
                ( isWebsite ? <div className="website-image-container" >
                    <div className="dots">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                    <img className="project-image" src={imgSrc} alt={title} /> 
                </div>
                : <img className="project-image" src={imgSrc} alt={title} /> )
            : <div className="project-image" />}
        </div>
    );
};

export default Project;
