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
            skills = ["Web Development", "HTML", "CSS", "JavaScript", "ReactJS"];
            github = "https://github.com/ethanratnofsky/Portfolio-Website";
            link = "/";
            imgSrc = PortfolioWebsiteImage;
            isWebsite = true;
            break;
        case "plasmid-visualizer":
            title = "Plasmid Visualizer";
            year = "2021";
            description = <>
                During my final summer as a Software Engineer Intern <a href="https://www.abbvie.com/" target="_blank" rel="noreferrer" ><i>AbbVie</i>'s</a> Bioresearch Center, I worked with two other student interns to develop an entire full stack applicatio from scratch.
                As a small team, we reported to two project managers who simply provided us with a general project specification as well as the resources necessary for the project's success.
                The goal of this project was to develop a web application with an interactive interface to visualize DNA sequences using a privately managed database.
                While the development of the project was primarily collaborative, most of my responsibilities included designing and implementing the backend server using a REST API.
                Consequently, I also managed and intitialized the internal custom database that was used for the application's functionality.
                While most of my focus for this project was on the backend development, I was able to exercise some of my frontend development skills to create temporary UIs for testing connection to the backend.
                My experience with this project enabled me to practice my skills and grow as a web developer in a professional, collaborative environment.
            </>;
            skills = ["Web Development", "REST API", "Python", "HTML", "CSS", "JavaScript", "ReactJS", "PostgreSQL"];
            // github = "https://github.com/ethanratnofsky/";
            // link = "https://example.com";
            // imgSrc = false;
            isWebsite = true;
            break;
        case "mass-spectrometry-toolkit-2":
            title = "Mass Spectrometry Toolkit 2.0";
            year = "2020-2021";
            description = <>
                During the prime season of the pandemic, that is the summer and winter of 2020 as well as part of the spring of 2021, I was given the opportunity to work remotely for <a href="https://www.abbvie.com/" target="_blank" rel="noreferrer" ><i>AbbVie</i>'s</a> Bioresearch Center as a Software Engineer Intern.
                The many projects I was assigned to included a revamp of an existing internal web application which was used by scientists to analyze data output from a mass spectrometer.
                The majority of my responsibilities for this project consisted of redesigning the frontend UI/UX.
                For example, I created a new color scheme, added an auto-completion feature for a searchable dropdown menu, reorganization of UI components, and restoration of button functionality.
                I am grateful for the opportunity that I had to take part in this project because it introduced me to the fundamentals related to web development including the <a href="https://flask.palletsprojects.com/en/2.0.x/" target="_blank" rel="noreferrer" >Flask</a> web framework and JavaScript library <a href="https://jquery.com/" target="_blank" rel="noreferrer" >jQuery</a>.
                I was also briefly introduced to <a href="https://www.docker.com/" target="_blank" rel="noreferrer" >Docker</a> for isolated container management as well as <a href="https://www.postgresql.org/" target="_blank" rel="noreferrer" >PostgreSQL</a> for elementary database management of user information.
                Ultimately, this project helped me, significantly, to develop the my preliminary skills as a web developer.
            </>;
            skills = ["Web Development", "REST API", "Python", "HTML", "CSS", "JavaScript", "Docker", "RegEx", "PostgreSQL"];
            // github = "https://github.com/ethanratnofsky/";
            // link = "https://example.com";
            // imgSrc = false;
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
            skills = ["Web Development", "REST API", "Python", "HTML", "CSS", "JavaScript", "Git"];
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
            : null}
        </div>
    );
};

export default Project;
