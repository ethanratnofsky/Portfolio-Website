import { ReactComponent as CartoonEthan } from "../images/cartoon_ethan.svg"

import "./Home.css"

function Home({ showMobileView }) {
    return (
        <div className={"home" + (showMobileView ? " mobile" : "")}>
            <CartoonEthan />
            <div className="info-container" >
                <h1>Hi, I'm Ethan Ratnofsky!</h1>
                <p>
                    I'm currently a junior studying computer science at Vanderbilt University.
                    I am a creative developer, entrepreneur, and artist.
                    I believe that mindfulness and experience are the keys to success.
                </p>
            </div>
        </div>
    )
};

export default Home;
