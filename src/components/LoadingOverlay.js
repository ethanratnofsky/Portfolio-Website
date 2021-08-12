import { ReactComponent as LogoSignature } from "../images/logo_signature.svg"

import '../styles/LoadingOverlay.css';

function LoadingOverlay() {
    return (
        <div className="loading-overlay-container" >
            <div className="loading-bar" />
            <LogoSignature />
            <div className="loading-bar" />
        </div>
    );
};

export default LoadingOverlay;
