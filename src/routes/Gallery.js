import { Link, Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

import GraphicDesign from "./GraphicDesign";
import Photography from "./Photography";

import "../styles/Gallery.css";

function Gallery() {
    let { path, url } = useRouteMatch();

    const galleryMenuComponent = <>
            <div className="gallery-menu" >
                <Link to={`${url}/graphic-design`} className="gallery-card graphic-design" >
                    <div className="overlay" />
                    <h2>Graphic Design</h2>
                </Link>
                <Link to={`${url}/photography`} className="gallery-card photography" >
                    <div className="overlay" />
                    <h2>Photography</h2>
                </Link>
            </div>
        </>;

    return (
        <div className="gallery-container" >
            <Switch>
                <Route exact path={`${path}/graphic-design`} >
                    <GraphicDesign />
                </Route>
                <Route exact path={`${path}/photography`} >
                    <Photography />
                </Route>
                <Route exact path={`${url}`} >
                    {galleryMenuComponent}
                </Route>
                <Route>
                    <Redirect to={`${url}`} />
                </Route>
            </Switch>
        </div>
    );
};

export default Gallery;
