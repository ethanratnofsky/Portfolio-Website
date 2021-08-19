import { ReactComponent as CartoonEthan } from "../images/cartoon_ethan.svg"
import { ReactComponent as GitHubIcon } from "../images/github.svg"
import { ReactComponent as LinkedInIcon } from "../images/linkedin.svg"
import { ReactComponent as GmailIcon } from "../images/gmail.svg"

import "../styles/Home.css"

function Home() {
    return (
        <div className="home-container">
            <CartoonEthan />
            <div className="info-container" >
                <h1>Hi, I'm Ethan Ratnofsky!</h1>
                <p>
                    Let me tell you a little bit about myself!
                    I was born and raised in the Greater Boston area, and I still refer to Newton, MA as "home, sweet home."
                    However, I am currently an undergraduate student studying Computer Science at Vanderbilt University in Nashville, TN.
                    I am a passionate developer, curious entrepreneur, and creative artist.
                    Explore my website for the proof in the pudding!
                </p>
                <div className="social-links" >
                    <a className="icon-link" href="https://github.com/ethanratnofsky" target="_blank" rel="noreferrer" ><GitHubIcon /></a>
                    <a className="icon-link" href="https://www.linkedin.com/in/ethan-ratnofsky/" target="_blank" rel="noreferrer" ><LinkedInIcon /></a>
                    <a className="icon-link" href="/#" ><GmailIcon /></a>
                </div>
            </div>
        </div>
    );
};

export default Home;
