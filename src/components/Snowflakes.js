import React, { useState, useEffect } from "react";

import "../styles/Snowflakes.css";

const Snowflakes = ({
    numSnowflakes = 40,
    minSize = 2,
    maxSize = 4,
    minDuration = 10,
    maxDuration = 15,
}) => {
    const [showSnowflakes, setShowSnowflakes] = useState(true);

    const toggleSnowflakes = () => setShowSnowflakes((prev) => !prev);

    useEffect(() => {
        console.log("Happy holidays! ❄️");
    }, []);

    return (
        <div className="snowflakes">
            {showSnowflakes && [...Array(numSnowflakes)].map((_, i) => {
                const size = Math.floor(Math.random() * maxSize + minSize);
                const duration =
                    Math.random() * (maxDuration - minDuration) + minDuration;

                const snowflakeContainerStyle = {
                    top: -size * 2 + "px",
                    left: Math.random() * 100 + "vw",
                    animationDelay: Math.random() * 15000 + "ms", // Fall delay
                    animationDuration: duration + "s",
                };

                const snowflakeStyle = {
                    width: size + "px",
                    height: size + "px",
                    boxShadow: `0 0 ${size}px white`,
                    animationDelay: Math.random() * 5 + "s", // Wiggle delay
                };

                return (
                    <div
                        key={i}
                        className="snowflake-container"
                        style={snowflakeContainerStyle}
                    >
                        <div className="snowflake" style={snowflakeStyle} />
                    </div>
                );
            })}
            <div className="snowflake-toggle" onClick={toggleSnowflakes}>
                {!showSnowflakes && 
                    <div className="snowflake-strike" />
                }
                ❄️
            </div>
        </div>
    );
};

export default Snowflakes;
