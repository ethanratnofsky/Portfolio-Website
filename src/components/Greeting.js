import { useEffect } from 'react';

import './Greeting.css';

function Greeting({ title, subtitle, duration = 4000, subtitleDelay = 1500, onFinished }) {
    useEffect(() => {
        const titleElement = document.querySelector(".greeting-title");
        const subtitleElement = document.querySelector(".greeting-subtitle");

        // Fade in title
        titleElement.classList.add("fade-in");

        // Fade in subtitle after subtitleDelay (default: 1500 ms)
        setTimeout(() => {
            subtitleElement.classList.add("fade-in");
        }, subtitleDelay);

        // Fade out title and subtitle after specified duration (default: 4000 ms)
        setTimeout(() => {
            titleElement.classList.replace("fade-in", "fade-out");
            subtitleElement.classList.replace("fade-in", "fade-out");
        }, duration);

        // call onFinished function after finished (fade out takes 1000 ms)
        setTimeout(onFinished, duration + 1000);
    });

    return (
        <header className="greeting-container" >
            <h1 className="greeting-title" >{title}</h1>
            <p className="greeting-subtitle" >{subtitle}</p>
        </header>
    );
};

export default Greeting;
