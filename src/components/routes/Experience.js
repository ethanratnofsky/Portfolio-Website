import React from 'react';

// Styles
import '../../styles/Experience.css';

// Constants
import EXPERIENCES from '../../experiences';

const Experience = () => {
    return (
        <div className='experience-container'>
            <ul className='experience-list'>
                {EXPERIENCES.map((experience, index) => (
                    <li className='experience-item' key={index}>
                        <div className='timeline-spot' />
                        <div className='experience-item-card'>
                            <img className='experience-item-logo' src={experience.logo} alt={experience.company} />
                            <div className='experience-item-content'>
                                <div className='experience-item-header'>
                                    <div className='left-header'>
                                        <a className='experience-item-company' href={experience.website} target='_blank' rel='noreferrer'>
                                            {experience.company}
                                        </a>
                                        <div className='experience-item-title'>
                                            {experience.title}
                                        </div>
                                    </div>
                                    <div className='right-header'>
                                        <div className='experience-item-dates'>
                                            {experience.startDate} – {experience.endDate}
                                        </div>
                                        <div className='experience-item-location'>
                                            {experience.location}
                                        </div>
                                    </div>
                                </div>
                                <ul className='experience-item-skills'>
                                    {experience.skills.map((skill, index) => (
                                        <li className='experience-item-skill' key={index}>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                                <p className='experience-item-description'>
                                    {experience.description}
                                </p>
                                <ul className='experience-item-bullets'>
                                    {experience.bullets.map((bullet, index) => (
                                        <li className='experience-item-bullet' key={index}>
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Experience;