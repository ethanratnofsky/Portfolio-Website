import { useEffect, useState } from 'react';

import './Greeting.css';

function Greeting({ title, subtitle, duration = 5000, subtitleDelay = 2000 }) {
    const [isVisible, setIsVisible] = useState(true);

    const greetingElement = (
        <header className="greetingContainer" >
            <h1 className="greetingTitle" >{title}</h1>
            <p className="greetingSubtitle" >{subtitle}</p>
        </header>
    );

    useEffect(() => {
        if (isVisible) {
            const titleElement = document.querySelector(".greetingTitle");
            const subtitleElement = document.querySelector(".greetingSubtitle");

            // Fade in title
            titleElement.classList.add("fadeIn");

            // Fade in subtitle after subtitleDelay (default: 2000ms)
            setTimeout(() => {
                subtitleElement.classList.add("fadeIn");
            }, subtitleDelay);

            // Fade out title and subtitle after specified duration (default: 5000ms)
            setTimeout(() => {
                titleElement.classList.replace("fadeIn", "fadeOut");
                subtitleElement.classList.replace("fadeIn", "fadeOut");
            }, duration);

            // Hide component after finished (fade out takes 1000ms)
            setTimeout(() => {
                setIsVisible(false);
            }, duration + 1000);
        };
    });

    return isVisible ? greetingElement : null;
};

export default Greeting;
