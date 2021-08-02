import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import reportWebVitals from './reportWebVitals';
import Greeting from "./components/Greeting";
import Navbar from "./components/Navbar";

import Projects from "./routes/Projects";
import Experience from "./routes/Experience";
import GraphicDesign from "./routes/GraphicDesign";
import Photography from "./routes/Photography";
import About from "./routes/About";
import ContactMe from "./routes/ContactMe";
import Home from "./routes/Home";

import './index.css';

function App() {
  const [isGreeting, setIsGreeting] = useState(true);

  const handleOnFinished = () => {
    setIsGreeting(false);
  };

  return (isGreeting ? <Greeting onFinished={handleOnFinished} /> :
    <>
      <Navbar />

      <Switch>
        <Route path="/projects" >
          <Projects />
        </Route>
        <Route path="/experience" >
          <Experience />
        </Route>
        <Route path="/graphic-design" >
          <GraphicDesign />
        </Route>
        <Route path="/photography" >
          <Photography />
        </Route>
        <Route path="/about" >
          <About />
        </Route>
        <Route path="/contact-me" >
          <ContactMe />
        </Route>
        <Route path="/" >
          <Home />
        </Route>
      </Switch>
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
