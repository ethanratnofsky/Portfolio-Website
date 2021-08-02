import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Hamburger from "./Hamburger.js"
import "./Navbar.css";
import {ReactComponent as LogoSignature} from '../images/logo_signature.svg';

const mobileWidthThreshold = 850; // The maximum number of pixels the window must be to be determined as mobile view

function Navbar() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobileView, setIsMobileView] = useState(null);
    const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

    function handleWindowResize() {
        setWindowWidth(window.innerWidth);
    };

    function handleHamburgerClick() {
        setIsMobileMenuActive(prevIsMobileMenuActive => !prevIsMobileMenuActive);
    }

    // Add/Cleanup window resize event listener
    useEffect(() => {
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []); // Empty array ensures that effect is only run on mount

    // Determine if window is narrow enough to be identified as mobile view
    useEffect(() => {
        setIsMobileView(windowWidth <= mobileWidthThreshold);
    }, [windowWidth]);

    // Reset isMobileMenuActive to false when isMobileView state changes
    useEffect(() => {
        setIsMobileMenuActive(false);
    }, [isMobileView]);

    return (
        <nav className={isMobileView ? "mobile" : ""} >
            <Link className="brand" to="/" >
                <LogoSignature />
            </Link>
            {isMobileView ? <Hamburger onClick={handleHamburgerClick} isActive={isMobileMenuActive} /> : null}
            <ul className={"menu" + (isMobileMenuActive ? " active" : "")} >
                <li><Link to="/projects" >Projects</Link></li>
                <li><Link to="/experience" >Experience</Link></li>
                <li><a href="/#" >Gallery</a>
                    <ul className="dropdown" >
                        <li><Link to="/graphic-design" >Graphic Design</Link></li>
                        <li><Link to="/photography" >Photography</Link></li>
                    </ul>
                </li>
                <li><Link to="/about" >About</Link></li>
                <li><Link to="/contact-me" >Contact Me</Link></li>
                <li><Link to="/#" >Resumé</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;