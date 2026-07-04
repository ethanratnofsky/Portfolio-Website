# Portfolio Website — Canonical Content Inventory

Source: `/Users/ethanratnofsky/Projects/Portfolio-Website` (verbatim capture prior to rebuild)

---

## 1. ROUTES

Defined in `src/components/App.js` using React Router (`HashRouter` mounted in `src/index.js`, so all routes are hash-based, e.g. `/#/projects`):

| Path | Component | Notes |
|---|---|---|
| `/` (index) | `Home` | |
| `/projects` | `Projects` (layout w/ `<Outlet />`) | |
| `/projects` (index child) | `ProjectsMenu` | List of project links |
| `/projects/:projectID` | `Project` | Detail page; looks up `PROJECTS` by `id` |
| `/experience` | `Experience` | |
| `/gallery` | `Gallery` | |
| `/coming-soon` | `Message` | `message="Coming Soon! 🥳"`, `submessage="Woah! You're here a little early...check back in a bit - this content is in development!"` |
| `*` (catch-all 404) | `Message` | `message="⚠️ 404 Page Not Found"`, submessage: `Hmm...it seems like this page doesn't exist. Go back to ` [`safety`](link to `/`) `!` — "safety" is a `<Link to="/">` |

Routing extras in `App.js`:
- Mobile view threshold: `MOBILE_VIEW_THRESHOLD = 890` px (adds `mobile` class to `.app-container`).
- Global click handler blurs the active element.
- Hash-change handler: redirects non-root pathnames to `/#<pathname>`, and fixes malformed hashes (slash not at index 1) by redirecting to `/#` + hash slice.
- Snowflakes only rendered in December: `new Date().getMonth() == 11 && <Snowflakes />` (in `index.js`).
- `LoadingOverlay` is rendered above `App` on every load (in `index.js`).

---

## 2. NAV (`src/components/Navbar.js`)

- **Logo**: `LogoSignature` SVG (`src/images/logo_signature.svg`), wrapped in `NavLink` to `/` with classes `logo icon-link`; clicking it hides the mobile menu.
- **Hamburger**: three-bar div (`top`/`middle`/`bottom`), gets `active` class when open; toggles mobile menu.
- **Menu links** (each `NavbarLink` has an animated `underline` div; clicking any link hides the mobile menu):
  - `Projects` → `/projects`
  - `Experience` → `/experience`
  - `Gallery` → `/gallery`
- **Resume button**: label `Resume` — opens `src/docs/EthanRatnofskyResume.pdf` in new tab (`target="_blank" rel="noreferrer"`).

---

## 3. HOME / HERO (`src/components/routes/Home.js`)

- **Illustration**: `CartoonEthan` SVG (`src/images/cartoon_ethan.svg`).
- **Heading (verbatim)**: `Hello, World!`
- **Bio copy (verbatim, paragraph breaks via `<br /><br />`)**:

> My name is Ethan Ratnofsky, and I am an undergraduate student studying Computer Science at Vanderbilt University in Nashville, TN.
>
> I am a passionate developer, curious entrepreneur, and creative artist born and raised in Newton, MA. I love adventuring and traveling, and, although I haven't checked off many destinations just yet, I hope to travel the world. Currently, I plan to pursue a career in software development.
>
> Welcome to my portfolio website - feel free to explore!

- **Social links** (class `icon-link`, SVG icons, `target="_blank" rel="noreferrer"` for external):
  - GitHub icon (`github.svg`), title `GitHub | Ethan Ratnofsky` → `https://github.com/ethanratnofsky`
  - LinkedIn icon (`linkedin.svg`), title `LinkedIn | Ethan Ratnofsky` → `https://www.linkedin.com/in/ethan-ratnofsky/`
  - Gmail icon (`gmail.svg`), title `Contact Me | Ethan Ratnofsky` → internal `Link` to `/coming-soon` (code comment: `TODO: Secure mailing system?`; a commented-out `<a href='/coming-soon'>` variant exists)

---

## 4. PROJECTS (`src/projects.js`)

**Data model fields** (per template comment in file): `id`, `title`, `year`, `github`, `link`, `skills` (array), `blurbs` (array of JSX), `images` (array of imported images), `demos` (array of JSX iframes), `isWebsite` (boolean).

**Detail page chrome** (`src/components/Project.js`):
- Back button: `←` arrow + text `Back to Projects` (links to `/projects`).
- GitHub icon link (title: `{title} | GitHub`) shown only if `github` truthy; external-link icon (title: `{title}`) only if `link` truthy.
- Skills rendered as pills; blurbs and images interleaved row by row; if `isWebsite` is true, images render inside a mock browser frame with three "dots"; image `alt` = project `title`.
- Project not found: `message="⚠️ 404 Project Not Found"`, submessage: `Uh oh! Looks like this project doesn't exist...` *`yet`* `. 😉` ("yet" italicized).

**Menu** (`src/components/ProjectsMenu.js`): renders `PROJECTS` titles as `Link`s to their `id`, staggered `animationDelay` of `100 * index` ms.

A code comment in `projects.js` between ReVU and Flopaholic: `// TODO: Insert Kinetik project?`

### 4.1 House Vandy
- `id`: `house-vandy` — `title`: `House Vandy` — `year`: `2022`
- `github`: `https://github.com/ethanratnofsky/House-Vandy`
- `link`: `http://129.114.25.44:8080/`
- `skills`: Web Development, MongoDB, Express.js, React, Node.js, REST API, Web Scraping, Chameleon Cloud, Docker
- `blurbs` (verbatim):
  1. "House Vandy is a web application that aims to assist Vanderbilt students in finding and comparing apartment listings near Vanderbilt's campus. The development of this project was motivated by the lack of a simple, centralized platform for students to find and compare apartment listings. The website allows users to filter and sort listings based on a variety of criteria, including price, size, and the number of bedrooms and bathrooms."
  2. "The project features custom web scrapers used to collect listings from the websites of four nearby apartment complexes (Acklen West End, Apollo Midtown, Artemis Midtown, and Elliston 23). The data from these scrapers is then stored in a MongoDB database and served to the frontend using a REST API. The scrapers are run every 24 hours using a Cron job to ensure that the data is up-to-date."
  3. "The project was created for CS-4287: Principles of Cloud Computing at Vanderbilt University. I worked with two other team members in designing the system architecture, developing the application from scratch, and deploying it to the Chameleon Cloud. Within the virtual machine on Chameleon Cloud, we built Docker containers for the frontend server, the backend server, and the four individual web scraping scripts."
- `images`: `house_vandy.png`, `house_vandy2.png`, `house_vandy3.png`
- `demos`: iframe `https://www.youtube.com/embed/3MtrtXvxNvY`, title `House Vandy (Demo)`, `allowFullScreen`
- `isWebsite`: `true`

### 4.2 Her Future Coalition
- `id`: `her-future-coalition` — `title`: `Her Future Coalition` — `year`: `2022-2023`
- `github`: `https://github.com/ChangePlusPlusVandy/hfc-frontend`
- `link`: `https://herfuturecoalition.org/`
- `skills`: Web Development, MongoDB, Express.js, React, Node.js, REST API, GitHub Actions
- `blurbs` (verbatim; "Her Future Coalition" is a hyperlink to `https://herfuturecoalition.org/`):
  1. "[Her Future Coalition] is a non-profit organization that actively works to fight against human trafficking and gender violence in India. The organization provides programs to help victims of these crimes and works to raise awareness about these issues. Their programs and services provide beneficiaries with education, job training, shelter, and mental health resources."
  2. "As an Engineering manager for Change++ at Vanderbilt University, I was responsible for leading a team of 5 developers to create a web application for Her Future Coalition. The web application allows the members of administration within the organization to manage and analyze data describing the organization's beneficiaries, programs, and workshops. Previously, the organization was using paper and Excel spreadsheets to manage this data, which was inefficient and prone to errors."
- `images`: `[]` — `demos`: `[]` — `isWebsite`: `true`

### 4.3 ReVU
- `id`: `revu` — `title`: `ReVU` — `year`: `2022`
- `github`: `https://github.com/ethanratnofsky/ReVU`
- `link`: `https://apps.apple.com/us/app/revu-by-vsg/id6444248468`
- `skills`: Mobile Development, MongoDB, Express.js, React Native, Node.js, REST API, Web Scraping, Mongoose, Heroku
- `blurbs` (verbatim; note original typo "Unviersity"):
  1. "ReVU is a mobile application created for the Vanderbilt Student Government to distribute a platform for students to review and rate dining halls on campus. The application enables users to post ratings and comments related to food quality and customer traffic for individual dining halls. Another key feature of this application is the ability for users to file complaints that are sent directly to the members of the Vanderbilt Student Government."
  2. "This project was created for CS-4278: Principles of Software Engineering at Vanderbilt Unviersity. I worked with three other team members in communicating with our stakeholders, designing the system architecture, developing the application from scratch, and deploying it to the App Store."
- `images`: `revu.png`, `revu2.png`, `revu3.png`, `revu4.png`
- `demos`: iframe `https://www.youtube.com/embed/2tMv6iRc1cE`, title `ReVU (Demo)`, `allowFullScreen`
- `isWebsite`: `false`

### 4.4 Flopaholic
- `id`: `flopaholic` — `title`: `Flopaholic` — `year`: `2022`
- `github`: `https://github.com/ethanratnofsky/Flopaholic`
- `link`: `https://ethanratnofsky.github.io/Flopaholic/`
- `skills`: Web Development, HTML, CSS, JavaScript, React, React Router, GitHub Pages
- `blurbs` (verbatim; note original typo "Flopholic" and the literal `\'` in source — renders as `Texas Hold\'em`):
  1. "Flopholic is a React web application that allows users to simulate Texas Hold\'em poker hands and test their knowledge of hand rankings. The application features a custom, random card generator and a custom algorithm for determining the ranking of a given hand. It also includes many configurable settings for the user to customize their experience."
  2. "A game version of the application is also in development. The game features different game modes and customizable settings. The future vision for the game is to implement leaderboards, other game modes, and statistics tracking. The game is currently available [here]." — "here" links to `https://ethanratnofsky.github.io/Flopaholic/#/game`
- `images`: `flopaholic.png`, `flopaholic2.png`
- `demos`: `[]` — `isWebsite`: `true`

### 4.5 United Front Against Riverblindness
- `id`: `UFAR` — `title`: `United Front Against Riverblindness` — `year`: `2021-2022`
- `github`: `https://github.com/ChangePlusPlusVandy/UFAR-frontend`
- `link`: `https://www.riverblindness.org/`
- `skills`: Mobile App Development, JavaScript, MongoDB, Express.js, React Native, Node.js, REST API
- `blurbs` (verbatim; note original typos "treaments" (x3) and "develoeprs"; "United Front Against Riverblindness (UFAR)" links to `https://www.riverblindness.org/`):
  1. "The [United Front Against Riverblindness (UFAR)] is a non-profit organization that actively fights against deadly diseases, such as riverblindness, in the Democratic Republic of the Congo. Their medical technicians travel to villages in Africa to administer medical treaments and collect data on the health of villages and distribution of treaments. The organization has been using paper forms to collect this data, which is both inefficient and prone to human error. As a member of the Change++ at Vanderbilt University, I collaborated with 5 other develoeprs to develop a mobile application for UFAR to collect and store data on the health of villages and distribution of treaments."
  2. "The primary problem that we were trying to solve was enabling the ability for medical technicians to collect and aggregate their data digitally. My team and I were faced with several other challenges during the development process, such as designing a system architecture that would enable the application to be used offline and syncing data between devices. Other challenges that we encountered included communicating with an international organization, developing the application to be used in French, and deploying the application to the Google Play Store."
- `images`: `[]` — `demos`: `[]` — `isWebsite`: `false`

### 4.6 Portfolio Website
- `id`: `portfolio-website` — `title`: `Portfolio Website` — `year`: `2021-2022`
- `github`: `https://github.com/ethanratnofsky/Portfolio-Website`
- `link`: `https://www.ethanratnofsky.com/`
- `skills`: Web Development, CSS, JavaScript, React, React Router, GitHub Pages
- `blurbs` (verbatim; inline links: "React" → `https://reactjs.org/`, "React Router" → `https://reactrouter.com/`, "JavaScript XML (JSX)" → `https://reactjs.org/docs/introducing-jsx.html`):
  1. "You're lookin' at it! I built this website to showcase my skills and experience in a unique and creative way. In fact, the only external libraries that are used in this project are the JavaScript libraries [React] and [React Router]. The React JavaScript library uses [JavaScript XML (JSX)] for rendering document elements, so no template engine is required. And, yes, although it takes more time and effort, no CSS frameworks are in use - only pure custom CSS. The benefits of using minimal external libraries/frameworks are greater control of design and deeper knowledge of programming concepts."
- `images`: `portfolio_website.png`
- `demos`: `[]` — `isWebsite`: `true`

### 4.7 Plasmid Visualizer
- `id`: `plasmid-visualizer` — `title`: `Plasmid Visualizer` — `year`: `2021`
- `github`: `""` (empty) — `link`: `""` (empty)
- `skills`: Web Development, REST API, Python, HTML, CSS, JavaScript, React, PostgresQL *(sic)*
- `blurbs` (verbatim; note original typo "intitialized" and missing word before "AbbVie's"; "*AbbVie*'s" (italic) links to `https://www.abbvie.com/`):
  1. "During my final summer as a Software Engineer Intern [*AbbVie*'s] Bioresearch Center, I worked with two other student interns to develop an entire full stack application from scratch. As a small team, we reported to two project managers who simply provided us with a general project specification as well as the resources necessary for the project's success. The goal of this project was to develop a web application with an interactive interface to visualize DNA sequences using a privately managed database. While the development of the project was primarily collaborative, most of my responsibilities included designing and implementing the backend server using a REST API. Consequently, I also managed and intitialized the internal custom database that was used for the application's functionality. While most of my focus for this project was on the backend development, I was able to exercise some of my frontend development skills to create temporary UIs for testing connection to the backend. My experience with this project enabled me to practice my skills and grow as a web developer in a professional, collaborative environment."
- `images`: `[]` — `demos`: `[]` — `isWebsite`: `true`

### 4.8 Mass Spectrometry Toolkit 2.0
- `id`: `mass-spectrometry-toolkit-2` — `title`: `Mass Spectrometry Toolkit 2.0` — `year`: `2020-2021`
- `github`: `""` (empty) — `link`: `""` (empty)
- `skills`: Web Development, REST API, Python, HTML, CSS, JavaScript, Docker, RegEx, PostgresQL *(sic)*
- `blurbs` (verbatim; note original phrasing "helped me, significantly, to develop the my preliminary skills"; inline links: "*AbbVie*'s" → `https://www.abbvie.com/`, "Flask" → `https://flask.palletsprojects.com/en/2.0.x/`, "jQuery" → `https://jquery.com/`, "Docker" → `https://www.docker.com/`, "PostgreSQL" → `https://www.postgresql.org/`):
  1. "During the prime season of the pandemic, that is the summer and winter of 2020 as well as part of the spring of 2021, I was given the opportunity to work remotely for [*AbbVie*'s] Bioresearch Center as a Software Engineer Intern. The many projects I was assigned to included a revamp of an existing internal web application which was used by scientists to analyze data output from a mass spectrometer. The majority of my responsibilities for this project consisted of redesigning the frontend UI/UX. For example, I created a new color scheme, added an auto-completion feature for a searchable dropdown menu, reorganization of UI components, and restoration of button functionality. I am grateful for the opportunity that I had to take part in this project because it introduced me to the fundamentals related to web development including the [Flask] web framework and JavaScript library [jQuery]. I was also briefly introduced to [Docker] for isolated container management as well as [PostgreSQL] for elementary database management of user information. Ultimately, this project helped me, significantly, to develop the my preliminary skills as a web developer."
- `images`: `[]` — `demos`: `[]` — `isWebsite`: `true`

### 4.9 Playlist Bridge
- `id`: `playlist-bridge` — `title`: `Playlist Bridge` — `year`: `2020`
- `github`: `https://github.com/ethanratnofsky/Playlist-Bridge`
- `link`: `https://playlistbridge.herokuapp.com`
- `skills`: Web Development, REST API, Python, HTML, CSS, JavaScript
- `blurbs` (verbatim; note original typo "aquisition"; "*Playlist Bridge*" italic (x2); "internship in the summer of 2020" is underlined (`<u>`); inline links: "Apple Music" → `https://www.apple.com/apple-music/`, "TIDAL" → `https://tidal.com/`, "Flask" → `https://flask.palletsprojects.com/en/2.0.x/`, "Jinja2" → `https://jinja.palletsprojects.com/en/3.0.x/`, "jQuery" → `https://jquery.com/`, "Bootstrap 4" → `https://getbootstrap.com/docs/4.6/getting-started/introduction/`):
  1. "*Playlist Bridge* is a web application which was built to convert music playlists from one streaming service to another. The development of the web application was inspired by a request from one of my good friends to share my music playlist with him. However, said friend streamed music on [Apple Music] and my playlist was created on [TIDAL]. Since we did not use the same music streaming service, we were not able to easily share music with one another. Also motivated by my then recent aquisition of beginner web development skills from my internship in the summer of 2020, I decided to start the construction of a web application that would handle bridging the gap between music streaming services. Enter *Playlist Bridge*. This project uses a Python backend built on the [Flask] web framework. Consequently, the template engine [Jinja2] and JavaScript library [jQuery] are also in use. The [Bootstrap 4] CSS framework is used as a supplement to custom pure CSS for frontend styling."
- `images`: `playlist_bridge.png`
- `demos`: `[]` — `isWebsite`: `true`

---

## 5. EXPERIENCE (`src/experiences.js`)

**Data model fields**: `company`, `website`, `title`, `startDate`, `endDate`, `location`, `skills` (array), `bullets` (array), `logo` (imported image). A `description` field exists in the render (`Experience.js` renders `experience.description`) but is commented out in every entry (`// description: 'This was a cool job.',`). Dates render as `{startDate} – {endDate}` (en dash). Logo and company name both link to `website` (new tab); logo `alt` = company name. Cards animate with `animationDelay` of `200 * index` ms; each has a `timeline-spot`.

### 5.1
- `company`: `Change++, Vanderbilt University` — `website`: `https://www.changeplusplus.org/`
- `title`: `Engineering Manager`
- `startDate`: `September 2022` — `endDate`: `Present` — `location`: `Nashville, TN`
- `skills`: Web Development, JavaScript, React, Node.js, MongoDB, Mongoose, Express.js, Git
- `bullets` (verbatim):
  - "Design system architecture for a web application used to manage and analyze data for beneficiaries of the non-profit organization Her Future Coalition"
  - "Provide technical leadership, mentorship, and resources to a team of 5 software developers"
  - "Manage and organize the GitHub repositories and database for the application"
  - "Collaborate and communicate with stakeholders and social workers in India"
- `logo`: `changeplusplus_logo.png`

### 5.2
- `company`: `Kinetik` — `website`: `https://kinetik.care`
- `title`: `Software Engineer Intern`
- `startDate`: `June 2022` — `endDate`: `August 2022` — `location`: `Long Island City, NY`
- `skills`: Web Development, JavaScript, HTML, CSS, React, Node.js, MongoDB, Git, Agile, Jira, Bitbucket
- `bullets` (verbatim):
  - "Developed a Node.js backend API service shared internally by all internal microservices to make efficient geographic location data requests"
  - "Improved and heavily refined source code and data management"
  - "Reduced expenses by significantly optimizing the number of external API requests"
  - "Collaborated with an intimate, ambitious team to nationally improve the NEMT industry"
- `logo`: `kinetik_logo.png`

### 5.3
- `company`: `Change++, Vanderbilt University` — `website`: `https://www.changeplusplus.org/`
- `title`: `Software Engineer`
- `startDate`: `October 2021` — `endDate`: `September 2022` — `location`: `Nashville, TN`
- `skills`: Mobile App Development, JavaScript, React Native, Node.js, MongoDB, Git
- `bullets` (verbatim):
  - "Constructed a mobile application with React Native used by medical technicians to collect and organize drug treatment information in the Democratic Republic of the Congo"
  - "Improved the collection of health information by developing an efficient technical solution"
  - "Collaborated with international stakeholders from the Africa-inspired nonprofit organization United Front Against Riverblindness (UFAR)"
  - "Coordinated and trained coworkers through the frontend development of the application"
- `logo`: `changeplusplus_logo.png`

### 5.4
- `company`: `AbbVie` — `website`: `https://www.abbvie.com/`
- `title`: `Software Engineer Intern`
- `startDate`: `June 2020` — `endDate`: `August 2021` — `location`: `Worcester, MA (Remote)`
- `skills`: Web Development, Python, REST API, JavaScript, HTML, CSS, React, Flask, jQuery, PostgreSQL, Docker, Git
- `bullets` (verbatim):
  - "Delivered two project presentations to 100+ Business Technology Solutions experts"
  - "Developed an internal, React web application for scientists to annotate DNA sequences"
  - "Designed and implemented a Python backend REST API to manage private databases"
- `logo`: `abbvie_logo.jpg`

---

## 6. GALLERY (`src/components/routes/Gallery.js`)

Two external link cards, each with a background image, a dark `overlay` div, and an `<h2>` label; both open in a new tab (`target="_blank" rel="noreferrer"`):

| Label (`<h2>`) | href | Background image | Card class |
|---|---|---|---|
| `Graphic Design` | `https://www.behance.net/ethanratnofsky` | `src/images/gallery/NinjaNahteyLogo2017.jpg` | `gallery-card graphic-design` |
| `Photography` | `https://www.flickr.com/photos/ethanratnofsky/` | `src/images/gallery/COVIDSZNPhotography.jpg` | `gallery-card photography` |

No captions or alt text beyond the labels (images are CSS backgrounds).

---

## 7. MISC UI TEXT

- **LoadingOverlay** (`src/components/LoadingOverlay.js`): no text — renders two `loading-bar` divs sandwiching the `LogoSignature` SVG (`logo_signature.svg`, id `logo-signature`). Shown on initial mount over everything.
- **Message component** (`src/components/Message.js`): generic — `<h1 class="message">{message}</h1>` + `<p class="submessage">{submessage}</p>`. Used for:
  - Coming Soon: `Coming Soon! 🥳` / `Woah! You're here a little early...check back in a bit - this content is in development!`
  - 404 page: `⚠️ 404 Page Not Found` / `Hmm...it seems like this page doesn't exist. Go back to safety!` ("safety" links to `/`)
  - Project 404: `⚠️ 404 Project Not Found` / `Uh oh! Looks like this project doesn't exist...yet. 😉` ("yet" italic)
- **Snowflakes easter egg** (`src/components/Snowflakes.js` + `src/index.js`):
  - Only rendered when `new Date().getMonth() == 11` (December).
  - Logs to console on mount: `Happy holidays! ❄️`
  - Defaults: `numSnowflakes = 40`, `minSize = 2`, `maxSize = 4`, `minDuration = 10`, `maxDuration = 15`; random size/position/fall delay (up to 15000ms)/duration/wiggle delay (up to 5s); snowflakes glow via `boxShadow: 0 0 {size}px white`.
  - Toggle button: a clickable `❄️` (`snowflake-toggle`); clicking toggles snowfall on/off; when off, a `snowflake-strike` div (strikethrough) renders over the emoji.
- **Footer**: none exists in the codebase.
- **Document title**: static `Ethan Ratnofsky` (from `public/index.html`); no per-route title changes.
- **noscript** (`public/index.html`): `You need to enable JavaScript to run this app.`
- **Resume PDF**: `src/docs/EthanRatnofskyResume.pdf` (navbar "Resume" button).
- **README.md** notable copy: "This GitHub repository houses the codebase for my personal portfolio website. The contents of my website include my personal achievements, portfolio, and resume. The deployed website is available at https://www.ethanratnofsky.com/." Pages listed: Home, Projects, Experience, Gallery, Resume. Features listed: "Visually appealing interface", "List of personal achievements/projects", "Downloadable resume", "Contact information". Stack: JavaScript (React, React Router), HTML, CSS. Dev setup: `git clone`, `cd Portfolio-Website`, `npm install`, `npm start` (localhost:3000).

---

## 8. HTML HEAD (`public/index.html`)

- `<html lang="en">`, `<meta charset="utf-8" />`
- **Title**: `Ethan Ratnofsky`
- **Meta description** (verbatim): `Ethan Ratnofsky's personal website for showcasing personal experiences, projects, and achievements.`
- **Meta keywords** (verbatim): `ethan, ratnofsky, personal, website, portfolio, resume, projects, achievements, experience, programming, software, engineer, coding`
- **Viewport**: `width=device-width, initial-scale=1`
- **Theme color**: `#000000`
- **No OG tags, no Twitter cards, no font links** (fonts are not loaded in HTML head).
- **Favicons**: `android-chrome-192x192.png` (192x192), `android-chrome-512x512.png` (512x512), `apple-touch-icon.png` (180x180), `favicon-32x32.png`, `favicon-16x16.png`, `favicon.ico` (shortcut icon).
- App mount point: `<div id="app"></div>`.

---

### Asset inventory referenced by content
- `src/images/logo_signature.svg` (navbar logo + loading overlay)
- `src/images/cartoon_ethan.svg` (home illustration)
- `src/images/github.svg`, `src/images/linkedin.svg`, `src/images/gmail.svg`, `src/images/external_link.svg` (icons)
- Project images: `flopaholic.png`, `flopaholic2.png`, `house_vandy.png`, `house_vandy2.png`, `house_vandy3.png`, `portfolio_website.png`, `playlist_bridge.png`, `revu.png`, `revu2.png`, `revu3.png`, `revu4.png`
- Experience logos: `abbvie_logo.jpg`, `changeplusplus_logo.png`, `kinetik_logo.png`
- Gallery: `src/images/gallery/NinjaNahteyLogo2017.jpg`, `src/images/gallery/COVIDSZNPhotography.jpg`
- Docs: `src/docs/EthanRatnofskyResume.pdf`
