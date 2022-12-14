import React, { useState } from "react";
import { NavLink } from "react-router-dom";

// Styles
import "../styles/Navbar.css";

// Files
import LogoSignature from "../images/logo_signature.svg";
import ResumePDF from "../docs/EthanRatnofskyResume.pdf";

// Hamburger Component
const Hamburger = ({ onClick, isActive }) => {
    return (
        <div
            onClick={onClick}
            className={"hamburger" + (isActive ? " active" : "")}
        >
            <div className="top" />
            <div className="middle" />
            <div className="bottom" />
        </div>
    );
};

// Custom Navbar Link Component
const NavbarLink = ({ label, href, onClick }) => {
    return (
        <div className="navbar-link" onClick={onClick}>
            <NavLink to={href}>
                {label}
                <div className="underline" />
            </NavLink>
        </div>
    );
};

// Resume Button Component
const ResumeButton = () => {
    return (
        <div className="resume-button">
            <a href={ResumePDF} target="_blank" rel="noreferrer">
                Resume
            </a>
        </div>
    );
};

// Navbar Component
const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);
    const hideMobileMenu = () => setShowMobileMenu(false);

    return (
        <nav className="navbar">
            <NavLink
                className="logo icon-link"
                to="/"
                onClick={hideMobileMenu}
            >
                <LogoSignature />
            </NavLink>
            <Hamburger
                onClick={toggleMobileMenu}
                isActive={showMobileMenu}
            />
            <ul className="menu">
                <li>
                    <NavbarLink
                        label="Projects"
                        href="/projects"
                        onClick={hideMobileMenu}
                    />
                </li>
                <li>
                    <NavbarLink
                        label="Experience"
                        href="/experience"
                        onClick={hideMobileMenu}
                    />
                </li>
                <li>
                    <NavbarLink
                        label="Gallery"
                        href="/gallery"
                        onClick={hideMobileMenu}
                    />
                </li>
                <li>
                    <ResumeButton />
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
