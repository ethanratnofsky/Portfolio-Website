import { useEffect } from 'react';

import '../styles/Greeting.css';

function Greeting({ onFinished }) {
    useEffect(() => {
        setTimeout(onFinished, 4500);
    }, [onFinished]);

    return (
        <header className="greeting-container" >
            <h1 className="greeting-title" >Hi, I'm Ethan!</h1>
            <p className="greeting-subtitle" >Welcome to my website.</p>
        </header>
    );
};

export default Greeting;
