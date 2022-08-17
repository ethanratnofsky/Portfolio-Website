import React from 'react'; // For JSX

// Images
import PortfolioWebsiteImage from './images/portfolio_website.png';
import PlaylistBridgeImage from './images/playlist_bridge.png';

/* Template for Project Object
{
    id: '',
    title: '',
    year: '',
    github: 'https://github.com/ethanratnofsky/',
    link: 'https://example.com/',
    skills: ['Skill 1', 'Skill 2', 'Skill 3'],
    blurbs: [
        'This is a template project.',
    ],
    images: [
        'https://picsum.photos/200/300',
    ],
    demos: [
        <iframe width='560' height='315' src='https://www.youtube.com/embed/xcJtL7QggTI' title='YouTube video player' frameBorder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowFullScreen />,
    ],
    isWebsite: true,
}
*/

const PROJECTS = [
    {
        id: 'flopaholic',
        title: 'Flopaholic',
        year: '2022',
        github: 'https://github.com/ethanratnofsky/Flopaholic',
        link: 'https://ethanratnofsky.github.io/Flopaholic/',
        skills: ['HTML', 'CSS', 'JavaScript', 'ReactJS', 'React Router'],
        blurbs: [
            'A React web application that allows users to simulate Texas Hold\'em poker hands and test their knowledge of hand rankings.',
        ],
        images: [],
        demos: [],
        isWebsite: true,
    },
    {
        id: 'UFAR',
        title: 'United Front Against Riverblindness',
        year: '2021-2022',
        github: '',
        link: '',
        skills: [],
        blurbs: [],
        images: [],
        demos: [],
        isWebsite: false,
    },
    {
        id: 'portfolio-website',
        title: 'Portfolio Website',
        year: '2021-2022',
        github: 'https://github.com/ethanratnofsky/Portfolio-Website',
        link: 'https://www.ethanratnofsky.com/',
        skills: ['HTML', 'CSS', 'JavaScript', 'ReactJS', 'React Router'],
        blurbs: [
            <>
                You're lookin' at it! I built this website to showcase my skills and experience in a unique and creative way.
                In fact, the only external libraries that are used in this project are the JavaScript libraries <a href='https://reactjs.org/' target='_blank' rel='noreferrer' >React</a> and <a href='https://reactrouter.com/' target='_blank' rel='noreferrer' >React Router</a>.
                The React JavaScript library uses <a href='https://reactjs.org/docs/introducing-jsx.html' target='_blank' rel='noreferrer' >JavaScript XML (JSX)</a> for rendering document elements, so no template engine is required.
                And, yes, although it takes more time and effort, no CSS frameworks are in use - only pure custom CSS. 
                The benefits of using minimal external libraries/frameworks are greater control of design and deeper knowledge of programming concepts.
            </>,
        ],
        images: [
            PortfolioWebsiteImage,
        ],
        demos: [],
        isWebsite: true,
    },
    {
        id: 'plasmid-visualizer',
        title: 'Plasmid Visualizer',
        year: '2021',
        github: '',
        link: '',
        skills: ['Web Development', 'REST API' ,'Python', 'HTML', 'CSS', 'JavaScript', 'ReactJS', 'PostgresQL'],
        blurbs: [
            <>
                During my final summer as a Software Engineer Intern <a href='https://www.abbvie.com/' target='_blank' rel='noreferrer' ><i>AbbVie</i>'s</a> Bioresearch Center, I worked with two other student interns to develop an entire full stack applicatio from scratch.
                As a small team, we reported to two project managers who simply provided us with a general project specification as well as the resources necessary for the project's success.
                The goal of this project was to develop a web application with an interactive interface to visualize DNA sequences using a privately managed database.
                While the development of the project was primarily collaborative, most of my responsibilities included designing and implementing the backend server using a REST API.
                Consequently, I also managed and intitialized the internal custom database that was used for the application's functionality.
                While most of my focus for this project was on the backend development, I was able to exercise some of my frontend development skills to create temporary UIs for testing connection to the backend.
                My experience with this project enabled me to practice my skills and grow as a web developer in a professional, collaborative environment.
            </>,
        ],
        images: [],
        demos: [],
        isWebsite: true,
    },
    {
        id: 'mass-spectrometry-toolkit-2',
        title: 'Mass Spectrometry Toolkit 2.0',
        year: '2020-2021',
        github: '',
        link: '',
        skills: ['Web Development', 'REST API' ,'Python', 'HTML', 'CSS', 'JavaScript', 'Docker', 'RegEx', 'PostgresQL'],
        blurbs: [
            <>
                During the prime season of the pandemic, that is the summer and winter of 2020 as well as part of the spring of 2021, I was given the opportunity to work remotely for <a href='https://www.abbvie.com/' target='_blank' rel='noreferrer' ><i>AbbVie</i>'s</a> Bioresearch Center as a Software Engineer Intern.
                The many projects I was assigned to included a revamp of an existing internal web application which was used by scientists to analyze data output from a mass spectrometer.
                The majority of my responsibilities for this project consisted of redesigning the frontend UI/UX.
                For example, I created a new color scheme, added an auto-completion feature for a searchable dropdown menu, reorganization of UI components, and restoration of button functionality.
                I am grateful for the opportunity that I had to take part in this project because it introduced me to the fundamentals related to web development including the <a href='https://flask.palletsprojects.com/en/2.0.x/' target='_blank' rel='noreferrer' >Flask</a> web framework and JavaScript library <a href='https://jquery.com/' target='_blank' rel='noreferrer' >jQuery</a>.
                I was also briefly introduced to <a href='https://www.docker.com/' target='_blank' rel='noreferrer' >Docker</a> for isolated container management as well as <a href='https://www.postgresql.org/' target='_blank' rel='noreferrer' >PostgreSQL</a> for elementary database management of user information.
                Ultimately, this project helped me, significantly, to develop the my preliminary skills as a web developer.
            </>,
        ],
        images: [],
        demos: [],
        isWebsite: true,
    },
    {
        id: 'playlist-bridge',
        title: 'Playlist Bridge',
        year: '2020',
        github: 'https://github.com/ethanratnofsky/Playlist-Bridge',
        link: 'https://playlistbridge.herokuapp.com',
        skills: ['Web Development', 'REST API' ,'Python', 'HTML', 'CSS', 'JavaScript', 'Git'],
        blurbs: [
            <>
                <i>Playlist Bridge</i> is a web application which was built to convert music playlists from one streaming service to another.
                The development of the web application was inspired by a request from one of my good friends to share my music playlist with him.
                However, said friend streamed music on <a href='https://www.apple.com/apple-music/' target='_blank' rel='noreferrer' >Apple Music</a> and my playlist was created on <a href='https://tidal.com/' target='_blank' rel='noreferrer' >TIDAL</a>.
                Since we did not use the same music streaming service, we were not able to easily share music with one another.
                Also motivated by my then recent aquisition of beginner web development skills from my <u>internship in the summer of 2020</u>, I decided to start the construction of a web application that would handle bridging the gap between music streaming services.
                Enter <i>Playlist Bridge</i>.
                This project uses a Python backend built on the <a href='https://flask.palletsprojects.com/en/2.0.x/' target='_blank' rel='noreferrer' >Flask</a> web framework.
                Consequently, the template engine <a href='https://jinja.palletsprojects.com/en/3.0.x/' target='_blank' rel='noreferrer' >Jinja2</a> and JavaScript library <a href='https://jquery.com/' target='_blank' rel='noreferrer' >jQuery</a> are also in use.
                The <a href='https://getbootstrap.com/docs/4.6/getting-started/introduction/' target='_blank' rel='noreferrer' >Bootstrap 4</a> CSS framework is used as a supplement to custom pure CSS for frontend styling.
            </>,
        ],
        images: [
            PlaylistBridgeImage,
        ],
        demos: [],
        isWebsite: true,
    }
];

export default PROJECTS;