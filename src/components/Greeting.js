import { useEffect, useState } from 'react';

import './Greeting.css';

function Greeting(props) {
    const [isVisible, setIsVisible] = useState(true);

    const greetingElement = (
        <header className="greetingContainer" >
            <h1 className="greetingTitle" >{props.title}</h1>
            <p className="greetingSubtitle" >{props.subtitle}</p>
        </header>
    );

    useEffect(() => {
        if (isVisible) {
            const titleElement = document.querySelector(".greetingTitle");
            const subtitleElement = document.querySelector(".greetingSubtitle");

            titleElement.classList.add("fadeIn");

            setTimeout(() => {
                subtitleElement.classList.add("fadeIn");
            }, 2000);

            setTimeout(() => {
                titleElement.classList.remove("fadeIn");
                subtitleElement.classList.remove("fadeIn");
                titleElement.classList.add("fadeOut");
                subtitleElement.classList.add("fadeOut");
            }, 5000);

            setTimeout(() => {
                setIsVisible(false);
            }, 6000);
        };
    });

    return isVisible ? greetingElement : null;
};

export default Greeting;
