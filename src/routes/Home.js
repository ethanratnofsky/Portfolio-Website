import { ReactComponent as CartoonEthan } from "../images/cartoon_ethan.svg"

import "../styles/Home.css"

function Home({ showMobileView }) {
    return (
        <div className={"home" + (showMobileView ? " mobile" : "")}>
            <CartoonEthan />
            <div className="info-container" >
                <h1>Hi, I'm Ethan Ratnofsky!</h1>
                <p>
                    Let me tell you a little bit about myself!
                    After being born and raised in the Greater Boston area, I still consider Newton, MA "home, sweet home."
                    However, I am currently an undergraduate student studying Computer Science at Vanderbilt University in Nashville, TN.
                    I am a passionate developer, curious entrepreneur, and creative artist.
                    Explore my website for the proof in the pudding!
                </p>
            </div>
        </div>
    )
};

export default Home;
