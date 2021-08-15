import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Navbar.css";
import {ReactComponent as LogoSignature} from '../images/logo_signature.svg';

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
            <Link to={href} onClick={onClick} >{label}</Link>
            <div className="underline" />
        </div>
    );
};

function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    function toggleShowMobileMenu() {
        setShowMobileMenu(prevShowMobileMenu => !prevShowMobileMenu);
    };

    return (
        <nav className="navbar" >
            <Link className="logo" to="/" onClick={() => setShowMobileMenu(false)} ><LogoSignature /></Link>
            <Hamburger onClick={toggleShowMobileMenu} isActive={showMobileMenu} />
            <ul className="menu" >
                <li><NavbarLink label="Projects" href="/projects" onClick={toggleShowMobileMenu} /></li>
                <li><NavbarLink label="Experience" href="/experience" onClick={toggleShowMobileMenu} /></li>
                <li><NavbarLink label="Gallery" href="/gallery" onClick={toggleShowMobileMenu} /></li>
                <li><NavbarLink label="Resume" href="/#" onClick={toggleShowMobileMenu} /></li>
            </ul>
        </nav>
    );
};

export default Navbar;
