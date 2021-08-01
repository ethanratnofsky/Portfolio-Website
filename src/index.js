import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import reportWebVitals from './reportWebVitals';
import Greeting from "./components/Greeting";
import Navbar from "./components/Navbar";

import './index.css';

function App() {
  const [isGreeting, setIsGreeting] = useState(true);

  const handleOnFinished = () => {
    setIsGreeting(false);
  };

  return (isGreeting ? <Greeting title="Hi, I'm Ethan!" subtitle="Welcome to my website." onFinished={handleOnFinished} /> :
    <>
      <Navbar />
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
