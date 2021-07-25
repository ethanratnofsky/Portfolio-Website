import { useEffect } from 'react';

import './Greeting.css';

function Greeting({ title, subtitle, duration = 4000, subtitleDelay = 1500, onFinished }) {
    useEffect(() => {
        const titleElement = document.querySelector(".greetingTitle");
        const subtitleElement = document.querySelector(".greetingSubtitle");

        // Fade in title
        titleElement.classList.add("fadeIn");

        // Fade in subtitle after subtitleDelay (default: 1500 ms)
        setTimeout(() => {
            subtitleElement.classList.add("fadeIn");
        }, subtitleDelay);

        // Fade out title and subtitle after specified duration (default: 4000 ms)
        setTimeout(() => {
            titleElement.classList.replace("fadeIn", "fadeOut");
            subtitleElement.classList.replace("fadeIn", "fadeOut");
        }, duration);

        // call onFinished function after finished (fade out takes 1000 ms)
        setTimeout(onFinished, duration + 1000);
    });

    return (
        <header className="greetingContainer" >
            <h1 className="greetingTitle" >{title}</h1>
            <p className="greetingSubtitle" >{subtitle}</p>
        </header>
    );
};

export default Greeting;
