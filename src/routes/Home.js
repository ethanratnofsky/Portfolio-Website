import { Link } from "react-router-dom";

import { ReactComponent as CartoonEthan } from "../images/cartoon_ethan.svg";
import { ReactComponent as GitHubIcon } from "../images/github.svg";
import { ReactComponent as LinkedInIcon } from "../images/linkedin.svg";
import { ReactComponent as GmailIcon } from "../images/gmail.svg";

import "../styles/Home.css"

function Home() {
    return (
        <div className="home-container">
            <CartoonEthan />
            <div className="info-container" >
                <div className="background-info" >
                    <h1>Hello, World!</h1>
                    <p>
                        My name is Ethan Ratnofsky, and I am an undergraduate student studying Computer Science at Vanderbilt University in Nashville, TN.<br />
                        <br />
                        I am a passionate developer, curious entrepreneur, and creative artist born and raised in Newton, MA.
                        I love adventuring and traveling, and, although I haven't checked off many destinations just yet, I hope to travel the world.
                        Currently, I plan to pursue a career in software development.<br />
                        <br />
                        Welcome to my portfolio website - feel free to explore!
                    </p>
                </div>
                <div className="social-links" >
                    <a className="icon-link" href="https://github.com/ethanratnofsky" target="_blank" rel="noreferrer" >
                        <GitHubIcon title="GitHub | Ethan Ratnofsky" />
                    </a>
                    <a className="icon-link" href="https://www.linkedin.com/in/ethan-ratnofsky/" target="_blank" rel="noreferrer" >
                        <LinkedInIcon title="LinkedIn | Ethan Ratnofsky" />
                    </a>
                    {/* TODO: Secure mailing system? */}
                    <Link className="icon-link" to="/coming-soon" >
                        <GmailIcon title="Contact Me | Ethan Ratnofsky" />
                    </Link>
                    {/* <a className="icon-link" href="/coming-soon" ><GmailIcon title="Contact Me | Ethan Ratnofsky" /></a> */}
                </div>
            </div>
        </div>
    );
};

export default Home;
