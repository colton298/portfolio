import React from "react";

export default function PlayStarSurvivors() {
  return (
    <>
      {/* FULLSCREEN GAME AREA */}
      <section
        className="unity-embed"
        style={{
          width: "100%",
          height: "calc(100vh - var(--header-h))",
          background: "#000",
        }}
      >
        <iframe
          src="/StarSurvivors/index.html"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          allow="fullscreen"
        />
      </section>
      <section className="game-info" style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "1rem" }}>Star Survivors</h1>

        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          Star Survivors is a roguelike similar to Vampire Survivors featuring weapons that are generated at runtime, based on the current level and character. 
          Objectives must be completed in order to progress. After all objectives are completed, the player can return to their ship to complete a level. 
        </p>

        <h2 style={{ marginTop: "2rem" }}>Download for Windows</h2>

        <a
          href="/StarSurvivorsWindows.zip"
          download
          className="download-btn"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.8rem 1.4rem",
            background: "var(--accent)",
            color: "var(--text)",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Download Star Survivors (Windows)
        </a>
        <h3>Credits:</h3>

        <ul className="credits-list">

          <li><strong>Colton Santiago</strong> — Levels, Objectives, Characters, XP System</li>
          <li><strong>Connor Hatfield</strong> — Genetic Algorithm (Weapons), Project Manager</li>
          <li><strong>Micah Ramirez</strong> — UI, Music</li>
          <li><strong>Anthony Vega</strong> — Enemies</li>

          {/* No bullet for this line */}
          <p style={{ margin: "0.8rem 0 0.4rem 0" }}>
            All in-game art was taken from free sources, credited below:
          </p>

          {/* LEVEL DESIGN SECTION */}
          <details className="credit-section">
            <summary><strong>Level Design</strong></summary>
            <ul className="sublist">
              <li>Spaceship — https://guardian5.itch.io/spaceship-asset</li>
              <li>Mars Background — https://www.vecteezy.com/vector-art/2037399-abstract-background-of-mars-surface</li>
              <li>Neptune Background — https://www.vecteezy.com/vector-art/2097266-abstract-background-of-neptune-surface</li>
              <li>Payload Sprite — https://silverink.itch.io/biped-robot</li>
              <li>Crystal Sprite — https://creativekind.itch.io/gif-bloodmoon-tower-free</li>
              <li>Jungle Background — https://blank-canvas.itch.io/free-pixel-art-looping-background-jungle</li>
              <li>Jungle Trees — https://graphscriptdev.itch.io/plant-trees</li>
            </ul>
          </details>

          {/* ENEMIES SECTION */}
          <details className="credit-section">
            <summary><strong>Enemies</strong></summary>
            <ul className="sublist">
              <li>Slime — https://rvros.itch.io/pixel-art-animated-slime</li>
              <li>Skeleton — https://monopixelart.itch.io/skeletons-pack</li>
              <li>Golems — https://monopixelart.itch.io/golems-pack</li>
              <li>Poison Sap — https://monopixelart.itch.io/flying-enemies</li>
              <li>Mushroom — https://monopixelart.itch.io/forest-monsters-pixel-art</li>
            </ul>
          </details>

          {/* CHARACTERS SECTION */}
          <details className="credit-section">
            <summary><strong>Characters</strong></summary>
            <ul className="sublist">
              <li>Astronaut — https://floatingkites.itch.io/cute-astronaut</li>
              <li>Ninja — https://cyberrumor.itch.io/16-bit-assassin</li>
              <li>Knight — https://cyberrumor.itch.io/animated-pixel-knight</li>
            </ul>
          </details>

          {/* WEAPONS SECTION */}
          <details className="credit-section">
            <summary><strong>Weapons</strong></summary>
            <ul className="sublist">
              <li>Guns — https://ranitaya-studios.itch.io/ranitayas-guns-pack-16-pixelart-guns</li>
              <li>Melee Weapons — https://ranitaya-studios.itch.io/ranitayas-swords-pack</li>
            </ul>
          </details>

          {/* SOUND EFFECTS SECTION */}
          <details className="credit-section">
            <summary><strong>Sound Effects</strong></summary>
            <ul className="sublist">
              <li>Game Over — https://freesound.org/people/dersuperanton/sounds/434465/</li>
              <li>UI — https://jdsherbert.itch.io/pixel-ui-sfx-pack</li>
              <li>Objective SFX — https://www.youtube.com/watch?v=jBsOdep6YqI</li>
              <li>SFX Creator — https://sfxr.me/</li>
              <li>Space Background — https://www.openaccessgovernment.org/james-webb-space-telescope-unveils-mysteries-of-the-brick/170959/</li>
            </ul>
          </details>

        </ul>


      </section>
    </>
  );
}

