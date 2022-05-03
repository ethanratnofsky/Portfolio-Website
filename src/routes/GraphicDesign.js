import { Link, useRouteMatch } from "react-router-dom";

import Message from "../components/Message";

import "../styles/GraphicDesign.css";

function GraphicDesign() {
    let url = useRouteMatch()[1];

    return (
        <div className="graphic-design-container" >
            <div className="back-button" >
                <Link to={`${url}`} >
                    <div className="arrow" >{"\u2190"}</div>
                    Back to Gallery
                </Link>
            </div>
            {/* <h1 className="page-title" >Graphic Design</h1> */}
            <Message message="Coming Soon! 🥳" submessage="Woah! You're here a little early...check back in a bit - this content is in development!" />
        </div>
    );
};

export default GraphicDesign;
