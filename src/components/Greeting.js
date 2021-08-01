import { useEffect, useRef } from 'react';

import './Greeting.css';

function Greeting({ title, subtitle, duration = 4000, subtitleDelay = 1500, onFinished }) {
    const titleElement = useRef(null);
    const subtitleElement = useRef(null);

    useEffect(() => {
        // Fade in subtitle after subtitleDelay (default: 1500 ms)
        setTimeout(() => {
            subtitleElement.current.classList.add("fade-in");
        }, subtitleDelay);

        // Fade out title and subtitle after specified duration (default: 4000 ms)
        setTimeout(() => {
            titleElement.current.classList.replace("fade-in", "fade-out");
            subtitleElement.current.classList.replace("fade-in", "fade-out");
        }, duration);

        // call onFinished function after finished (fade out takes 1000 ms)
        setTimeout(onFinished, duration + 1000);
    }, [duration, onFinished, subtitleDelay]);

    return (
        <header className="greeting-container" >
            <h1 className="greeting-title fade-in" ref={titleElement} >{title}</h1>
            <p className="greeting-subtitle" ref={subtitleElement} >{subtitle}</p>
        </header>
    );
};

export default Greeting;
