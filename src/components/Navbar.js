import { useState } from "react";
import { NavLink } from "react-router-dom";

import "../styles/Navbar.css";
import {ReactComponent as LogoSignature} from '../images/logo_signature.svg';
import ResumeButton from "./ResumeButton";

function Hamburger({ onClick, isActive }) {
    return (
        <div onClick={onClick} className={"hamburger" + (isActive ? " active" : "")} >
            <div className="top" />
            <div className="middle" />
            <div className="bottom" />
        </div>
    );
};

function NavbarLink({ label, href, onClick }) {
    return (
        <div className="navbar-link" >
            <NavLink to={href} onClick={() => {document.activeElement.blur(); onClick();}} activeClassName="active" >
                {label}
                <div className="underline" />
            </NavLink>
        </div>
    );
};

function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <nav className="navbar" >
            <NavLink className="logo icon-link" to="/" onClick={() => {document.activeElement.blur(); setShowMobileMenu(false)}} ><LogoSignature /></NavLink>
            <Hamburger onClick={() => setShowMobileMenu(prev => !prev)} isActive={showMobileMenu} />
            <ul className="menu" >
                <li><NavbarLink label="Projects" href="/projects" onClick={() => setShowMobileMenu(false)} /></li>
                <li><NavbarLink label="Experience" href="/experience" onClick={() => setShowMobileMenu(false)} /></li>
                <li><NavbarLink label="Gallery" href="/gallery" onClick={() => setShowMobileMenu(false)} /></li>
                <li><ResumeButton /></li>
            </ul>
        </nav>
    );
};

export default Navbar;
