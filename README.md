# Website-Portfolio
This GitHub repository houses the codebase for my personal website. The contents of my website include my personal achievements, portfolio, and resumé.
## Pages
- Home (introduction)
- Experience
- Projects
- Graphic Design (under Gallery)
- Photography (under Gallery)
- About
- Contact Me
## Features
- Visually appealing interface
- Custom handwritten font
- List of personal achievements/projects
- Downloadable resumé
- Contact information
## Setup Instructions For Local Development
After cloning this repository, navigate to the project root and install the necessary dependencies in your environment with `pip install -r requirements.txt`. Then, export the necessary environment variables with the following sequence of commands:
```
export FLASK_APP=app.py
export FLASK_ENV=development
```
Finally, start the Flask server with `flask run`. The website will now be live at <http://localhost:5000>.
