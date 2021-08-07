import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Hamburger from "./Hamburger.js"
import "./Navbar.css";
import {ReactComponent as LogoSignature} from '../images/logo_signature.svg';

const mobileWidthThreshold = 890; // The maximum number of pixels the window must be to be determined as mobile view

function Navbar() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showMobileView, setShowMobileView] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const dropdownTriggerElement = useRef(null);

    function handleHamburgerClick() {
        setShowMobileMenu(prevShowMobileMenu => !prevShowMobileMenu);
    };

    function handleShowDropdown() {
        setShowDropdown(true);
    };

    function handleHideDropdown() {
        setShowDropdown(false);
    };

    // Add/Cleanup window resize event listener
    useEffect(() => {
        function handleWindowResize() {
            setWindowWidth(window.innerWidth);
        };
    
        // Handle mobile touch events to show/hide dropdown menu
        function handleTouchEnd(e) {
            if (!showDropdown && e.target === dropdownTriggerElement.current) {
                setShowDropdown(true);
            }
            else if (showDropdown && e.target !== dropdownTriggerElement.current) {
                setShowDropdown(false);
            };
        };

        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("touchend", handleTouchEnd);
        return () => {
            window.removeEventListener("resize", handleWindowResize);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [showDropdown]); // Empty array ensures that effect is only run on mount

    // Determine if window is narrow enough to be identified as mobile view
    useEffect(() => {
        setShowMobileView(windowWidth <= mobileWidthThreshold);
    }, [windowWidth]);

    // Hide menus when view changes
    useEffect(() => {
        setShowMobileMenu(false);
        setShowDropdown(false);
    }, [showMobileView]);

    return (
        <nav className={showMobileView ? "mobile" : ""} >
            <div className="bar" >
                <Link className="brand" to="/"><LogoSignature /></Link>
                {showMobileView ? <Hamburger onClick={handleHamburgerClick} isActive={showMobileMenu} /> : null}
            </div>
            <ul className={"menu" + (showMobileMenu ? " active" : "")} >
                <li><Link to="/projects" >Projects</Link></li>
                <li><Link to="/experience" >Experience</Link></li>
                <li><button ref={dropdownTriggerElement}
                        onFocus={handleShowDropdown}
                        onBlur={handleHideDropdown}
                        onMouseEnter={handleShowDropdown}
                        onMouseLeave={handleHideDropdown} >Gallery</button></li>
                <li><Link to="/about" >About</Link></li>
                <li><Link to="/contact-me" >Contact Me</Link></li>
                <li><Link to="/#" >Resumé</Link></li>
            </ul>
            <ul className={"dropdown" + (showDropdown ? " show" : "")}
                onFocus={handleShowDropdown}
                onBlur={handleHideDropdown}
                onMouseEnter={handleShowDropdown}
                onMouseLeave={handleHideDropdown} >
                <li><Link to="/graphic-design" >Graphic Design</Link></li>
                <li><Link to="/photography" >Photography</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
