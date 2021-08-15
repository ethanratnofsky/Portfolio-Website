import { Link } from "react-router-dom";

function Gallery() {
    return (
        <>
            <p>Gallery</p>
            <Link to="/gallery/graphic-design" >Graphic Design</Link>
            <Link to="/gallery/photography" >Photography</Link>
        </>
    )
};

export default Gallery;
