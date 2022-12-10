// Images
import AbbvieLogo from "./images/abbvie_logo.jpg";
import ChangePlusPlusLogo from "./images/changeplusplus_logo.png";
import KinetikLogo from "./images/kinetik_logo.png";

const EXPERIENCES = [
    {
        company: "Change++, Vanderbilt University",
        website: "https://www.changeplusplus.org/",
        title: "Software Engineer",
        startDate: "October 2021",
        endDate: "Present",
        location: "Nashville, TN",
        skills: [
            "Mobile App Development",
            "JavaScript",
            "React Native",
            "Node.js",
            "MongoDB",
            "Git",
        ],
        // description: 'This was a cool job.',
        bullets: [
            "Constructed a mobile application with React Native used by medical technicians to collect and organize drug treatment information in the Democratic Republic of the Congo",
            "Improved the collection of health information by developing an efficient technical solution",
            "Collaborated with international stakeholders from the Africa-inspired nonprofit organization United Front Against Riverblindness (UFAR)",
            "Coordinated and trained coworkers through the frontend development of the application",
        ],
        logo: ChangePlusPlusLogo,
    },
    {
        company: "Kinetik",
        website: "https://kinetik.care",
        title: "Software Engineer Intern",
        startDate: "June 2022",
        endDate: "August 2022",
        location: "Long Island City, NY",
        skills: [
            "Web Development",
            "JavaScript",
            "HTML",
            "CSS",
            "React",
            "Node.js",
            "MongoDB",
            "Git",
            "Agile",
            "Jira",
            "Bitbucket",
        ],
        // description: 'This was a cool job.',
        bullets: [
            "Developed a Node.js backend API service shared internally by all internal microservices to make efficient geographic location data requests",
            "Improved and heavily refined source code and data management",
            "Reduced expenses by significantly optimizing the number of external API requests",
            "Collaborated with an intimate, ambitious team to nationally improve the NEMT industry",
        ],
        logo: KinetikLogo,
    },
    {
        company: "AbbVie",
        website: "https://www.abbvie.com/",
        title: "Software Engineer Intern",
        startDate: "June 2020",
        endDate: "August 2021",
        location: "Worcester, MA (Remote)",
        skills: [
            "Web Development",
            "Python",
            "REST API",
            "JavaScript",
            "HTML",
            "CSS",
            "React",
            "Flask",
            "jQuery",
            "PostgreSQL",
            "Docker",
            "Git",
        ],
        // description: 'This was a cool job.',
        bullets: [
            "Delivered two project presentations to 100+ Business Technology Solutions experts",
            "Developed an internal, React web application for scientists to annotate DNA sequences",
            "Designed and implemented a Python backend REST API to manage private databases",
        ],
        logo: AbbvieLogo,
    },
];

export default EXPERIENCES;
