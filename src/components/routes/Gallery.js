import React from "react";

// Images
import NinjaNahteyLogo2017 from "../../images/gallery/NinjaNahteyLogo2017.jpg";
import COVIDSZNPhotography from "../../images/gallery/COVIDSZNPhotography.jpg";

// Styles
import "../../styles/Gallery.css";

const Gallery = () => {
    return (
        <div className="gallery-container">
            <div className="gallery-menu">
                <a
                    href="https://www.behance.net/ethanratnofsky"
                    className="gallery-card graphic-design"
                    style={{ backgroundImage: `url(${NinjaNahteyLogo2017})` }}
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="overlay" />
                    <h2>Graphic Design</h2>
                </a>
                <a
                    href="https://www.flickr.com/photos/ethanratnofsky/"
                    className="gallery-card photography"
                    style={{ backgroundImage: `url(${COVIDSZNPhotography})` }}
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="overlay" />
                    <h2>Photography</h2>
                </a>
            </div>
        </div>
    );
};

export default Gallery;
