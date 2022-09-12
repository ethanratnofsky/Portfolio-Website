import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Components
import Message from '../components/Message';

// Styles
import '../styles/Project.css'

// Icons
import GitHubIcon from '../images/github.svg';
import ExternalLinkIcon from '../images/external_link.svg';

// Constants
import PROJECTS from '../projects.js';

const BackButton = () => {
    return (
        <div className='back-button'>
            <Link to='/projects'>
                <div className='arrow'>{'\u2190'}</div>
                Back to Projects
            </Link>
        </div>
    );
}

const Project = () => {
    const { projectID } = useParams(); // Get requested project ID from URL
    const project = PROJECTS.find(({ id }) => id === projectID); // Find project with matching ID

    // If project not found, show error message
    if (project === undefined) {
        return (
            <div className='project-container'>
                <BackButton />
                <Message message='⚠️ 404 Project Not Found' submessage={<>Uh oh! Looks like this project doesn't exist...<i>yet</i>. 😉</>} />
            </div>
        );
    }

    // If project found, extract project data
    const { title, year, github, link, skills, blurbs, images, demos, isWebsite } = project;

    return (
        <div className='project-container'>
            <BackButton />
            <div className='project-header'>
                <div>
                    <h1 className='project-title'>{title}</h1>
                    <div className='project-year'>{year}</div>
                </div>
                <ul className='project-links'>
                    {github && 
                        <li>
                            <a className='icon-link' href={github} target='_blank' rel='noreferrer'>
                                <GitHubIcon title={title + ' | GitHub'} />
                            </a>
                        </li>
                    }
                    {link &&
                        <li>
                            <a className='icon-link' href={link} target='_blank' rel='noreferrer'>
                                <ExternalLinkIcon title={title} />
                            </a>
                        </li>
                    }
                </ul>
            </div>
            <ul className='project-skills'>
                {skills.map((skill, i) => <li className='project-skill' key={i}>{skill}</li>)}
            </ul>

            <div className='project-content'>
                {Array(Math.max(blurbs.length, demos.length + images.length)).fill().map((_, i) => (
                    <div key={i} className='project-content-row'>
                        {blurbs[i] && <div className='project-blurb'>{blurbs[i]}</div>}
                        {demos[i] ? <div className='project-demo'>{demos[i]}</div>
                            : 
                            images[i - demos.length] && (isWebsite ? 
                                <div className='website-image-container'>
                                    <div className='dots'>
                                        <div className='dot' />
                                        <div className='dot' />
                                        <div className='dot' />
                                    </div>
                                    <img className='project-image' src={images[i]} alt={title} /> 
                                </div>
                                : <img className='project-image' src={images[i]} alt={title} />
                            )
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Project;
