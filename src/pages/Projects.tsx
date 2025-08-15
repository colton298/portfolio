import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Projects() {
  const wordleUrl = `${import.meta.env.BASE_URL}wordle-solver/index.html`;

  return (
    <section className="projects-page">
      <Helmet>
        <title>Colton Santiago | Projects</title>
        <meta
          name="description"
          content="Projects by Colton Santiago"
        />
        <meta property="og:title" content="Colton Santiago | Projects" />
        <meta
          property="og:description"
          content="See Colton Santiago’s projects"
        />
      </Helmet>

      <h2>To-Do List</h2>
      <p>
        This to do list project is hosted on my website and allows users to add items they need to do each day and at what time.
        This project has full login, forgot password, and email verification functonality. 
      </p>
      <Link to="/login" className="button">
        Try it Here
      </Link>

      <h2>Wordle Solver</h2>
      <p>
        I love playing Wordle with my friends and family, and have done so for my years.
        So, I created a Wordle solver using JavaScript and CSS. This can accurately solve
        any Wordle, using the words from the real game!
      </p>

      <Link to="/wordle" className="button">
        Try it Here
      </Link>

      <h2>COP4331 (Processes for Object Oriented Software Development) - Project Manager</h2>
      <p>In this course, I oversaw the completion of two projects.</p>

      <h3>Small Project - Jungle Contact Book</h3>
      <p>
        Our team developed a website that allows users to sign up, add contacts to a list
        with a variety of information, delete contacts, and edit them. I personally created
        the presentation for this project, setup the domain and initial website, developed
        meeting talking points, and created all the diagrams present in our presentation.
      </p>
      <h4>Presentation Slides</h4>
      <div className="slides-embed">
        <iframe
          src="https://docs.google.com/presentation/d/e/2PACX-1vQe-FPUfPq9du39R5POld1k7CDgKZ5SFg8W5DStlLoMts1FjHIUoVKhvgfBmtWToJZg402KCC6qkSOh/pubembed?start=false&loop=false&delayms=3000"
          width="100%"
          height="300"
          style={{ border: "none" }}
          allowFullScreen
          title="Jungle Contact Book Slides"
        />
      </div>

      <h3>Large Project - Digital Wellness</h3>
      <p>In this larger project, we developed a website and app where users can:</p>
      <ul>
        <li>Track their days by adding activities and timing them</li>
        <li>Rank themselves against other users with a leaderboard and point system</li>
        <li>Utilize email verification and a forgot password system for security</li>
      </ul>
      <p>
        Once again, I created the presentation and associated diagrams, while also tracking
        team progress using a gantt chart and meeting talking points.
      </p>
      <h4>Presentation Slides</h4>
      <div className="slides-embed">
        <iframe
          src="https://docs.google.com/presentation/d/e/2PACX-1vRc2JH0IYydreVK3HXYpAHFeJZrLzo-68lQkv5ctTzlgc4mf8ot4S6wKLjNESam4EWK9ZxEhiFRu8Wy/pubembed?start=false&loop=false&delayms=3000"
          width="100%"
          height="300"
          style={{ border: "none" }}
          allowFullScreen
          title="Digital Wellness Slides"
        />
      </div>

      <h2>This Website!</h2>
      <p>
        I coded this project from scratch, using React. Check out my code using the
        github link:
      </p>
      <p>
        GitHub:{" "}
        <a href="https://github.com/colton298/newportfolio" target="_blank" rel="noreferrer">
          https://github.com/colton298/portfolio
        </a>
      </p>
    </section>
  );
}
