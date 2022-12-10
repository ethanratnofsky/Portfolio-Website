import React from "react";

// SVG
import LogoSignature from "../images/logo_signature.svg";

// Styles
import "../styles/LoadingOverlay.css";

const LoadingOverlay = () => {
    return (
        <div className="loading-overlay-container">
            <div className="loading-bar" />
            <LogoSignature id="logo-signature" />
            <div className="loading-bar" />
        </div>
    );
};

export default LoadingOverlay;
