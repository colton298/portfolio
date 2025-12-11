import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo, useCallback, useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TabKey = "personal" | "class";

function InHeaderSlot({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(document.getElementById("subheader-slot"));
  }, []);
  return slot ? createPortal(children, slot) : <>{children}</>;
}

export default function Projects() {
  const [params, setParams] = useSearchParams();

  const activeTab: TabKey = useMemo(() => {
    const t = params.get("tab");
    return t === "class" ? "class" : "personal";
  }, [params]);

  const setTab = useCallback(
    (tab: TabKey) => {
      const next = new URLSearchParams(params);
      next.set("tab", tab);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const isPersonal = activeTab === "personal";
  const isClass = activeTab === "class";

  return (
    <section className="projects-page">
      <Helmet>
        <title>Colton Santiago | Projects</title>
        <meta name="description" content="Projects by Colton Santiago" />
        <meta property="og:title" content="Colton Santiago | Projects" />
        <meta property="og:description" content="See Colton Santiago’s projects" />
      </Helmet>


      {/* Subheader / Tabs */}
      <InHeaderSlot>
      <div
        className="projects-subnav"
        role="tablist"
        aria-label="Project categories"
      >
        <button
          role="tab"
          aria-selected={isPersonal}
          aria-controls="personal-panel"
          id="personal-tab"
          className={`subnav-tab${isPersonal ? " active" : ""}`}
          onClick={() => setTab("personal")}
        >
          Personal Projects
        </button>
        <button
          role="tab"
          aria-selected={isClass}
          aria-controls="class-panel"
          id="class-tab"
          className={`subnav-tab${isClass ? " active" : ""}`}
          onClick={() => setTab("class")}
        >
          Class Projects
        </button>
      </div>
    </InHeaderSlot>

      {/* Panels */}
      <div className="projects-panels">
        {/* Personal Projects Panel */}
        <div
          role="tabpanel"
          id="personal-panel"
          aria-labelledby="personal-tab"
          hidden={!isPersonal}
        >
          <h2>Tri Peaks Solitaire Card Game</h2>
          <p>
            I have added Tri Peaks Solitaire to my website. This uses the same login/signup database as my to-do list.
          </p>
          <Link to="/game" className="button">Try it Here</Link>

          <h2>To-Do List</h2>
          <p>
            This to-do list project is hosted on my website and allows users to add items they need to do each day and at what time.
            Users can choose to list to-do items at a singular time, within a span of time, or simply on a specific day.
            In addition, users can view their daily, weekly, and monthly tasks using the timeline panel, which updates when users modify their to-do list.
            This project has full login, forgot password, and email verification functonality.
          </p>
          <Link to="/login" className="button">Try it Here</Link>

          <h2>Wordle Solver</h2>
          <p>
            I love playing Wordle with my friends and family, and have done so for my years.
            So, I created a Wordle solver using JavaScript. This can accurately solve
            any Wordle, using the words from the real game!
          </p>
          <Link to="/wordle" className="button">Try it Here</Link>

          <h2>This Website!</h2>
          <p>
            I coded this project from scratch, using React and TypeScript. Check out my code using the
            github link:
          </p>
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/colton298/portfolio"
              target="_blank"
              rel="noreferrer"
            >
              https://github.com/colton298/portfolio
            </a>
          </p>

          <h3>Sign out from my projects that require login</h3>
          <p>(To-Do List, Card Game, etc.):</p>
          <Link to="/signout?next=/projects" className="button">Sign Out</Link>
        </div>

        {/* Class Projects Panel */}
        <div
          role="tabpanel"
          id="class-panel"
          aria-labelledby="class-tab"
          hidden={!isClass}
        >
          <h2>Senior Design</h2>
          <h3>Project Manager - LabScity</h3>
          <p>Developing a website for scientists and researchers to connect. Core features include:</p>
          <ul>
            <li>Posts, sorted by genre and your interests, to show areas of research most relevant to you</li>
            <li>A project group system where researchers can connect to help better communicate</li>
            <li>Automated moderation to ensure conversations stay science-oriented</li>
          </ul>

          <h2>AI for Game Programming</h2>
          <h3>Developer</h3>
          <p>Worked with a team of 4 to develop a roguelike with special AI elements. My personal contributions to the game include:</p>
          <ul>
            <li>Levels</li>
            <li>Objectives</li>
            <li>Characters</li>
            <li>XP System</li>
          </ul>
          <p>The game can be played online (or downloaded) below:</p>
          <Link to="/PlayStarSurvivors" className="button">Try it Here</Link>

          <h2>Database Systems</h2>
          <h3>Developer</h3>
          <p>Worked with a team of 3 to develop a prototype web app for food donations. This project uses PHP and SQL. I personally developed:</p>
          <ul>
            <li>Database Schema</li>
            <li>Sign-Up/Sign-In Pages</li>
            <li>Home, Edit Profile, Restaurant Pages</li>
            <li>Project Aesthetic</li>
          </ul>
          <p>The project's code can be viewed at</p>
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/colton298/DatabaseProject"
              target="_blank"
              rel="noreferrer"
            >
              https://github.com/colton298/DatabaseProject
            </a>
          </p>
          <h4>A look at my pages:</h4>
          <div className="slides-embed">
            <iframe
              src="https://docs.google.com/presentation/d/e/2PACX-1vRtlBKVdT2DLwQInIM2wCcGUQ5wLGlKEVd1X3yA_yvMoxAVgAokm5mw6KnFKY0fEU0sZSkx1NZao6az/pubembed?start=false&loop=false&delayms=3000"
              width="100%"
              height="300"
              style={{ border: "none" }}
              allowFullScreen
              title="Database Systems Slides"
            />
          </div>
          
          <h2>
            Processes for Object Oriented Software Development - Project Manager
          </h2>
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
        </div>
      </div>
    </section>
  );
}
