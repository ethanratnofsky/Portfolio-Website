import { useState } from "react";

import Greeting from "./components/Greeting";

function App() {
  const [isGreeting, setIsGreeting] = useState(true);

  const handleOnFinished = () => {
    setIsGreeting(false);
  };

  return (isGreeting ? <Greeting title="Hi, I'm Ethan!" subtitle="Welcome to my website." onFinished={handleOnFinished} /> :
    <div className="App">
      <h1>Hello, world!</h1>
    </div>
  );
}

export default App;
