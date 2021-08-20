import { Link, Route, Switch, useRouteMatch } from "react-router-dom";

import GraphicDesign from "./GraphicDesign";
import Photography from "./Photography";

import "../styles/Gallery.css";

function Gallery() {
    let { path, url } = useRouteMatch();

    return (
        <div className="gallery-container" >
            <div className="gallery-menu" >
                <Link to={`${url}/graphic-design`} >Graphic Design</Link>
                <Link to={`${url}/photography`} >Photography</Link>
            </div>

            <Switch>
                <Route exact path={`${path}/graphic-design`} >
                    <GraphicDesign />
                </Route>
                <Route exact path={`${path}/photography`} >
                    <Photography />
                </Route>
            </Switch>
        </div>
    );
};

export default Gallery;
