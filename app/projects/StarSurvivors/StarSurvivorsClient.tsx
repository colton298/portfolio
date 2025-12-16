"use client";

import "./starsurvivors.css";

export default function StarSurvivorsClient() {
  return (
    <>
      {/* GAME EMBED */}
      <section className="unity-embed">
        <iframe
          src="/StarSurvivors/index.html"
          className="unity-frame"
          allow="fullscreen"
          title="Star Survivors"
        />
      </section>

      {/* GAME INFO */}
      <section className="game-info">
        <h1 className="text-3xl font-semibold mb-2">Star Survivors</h1>

        <p>
          Star Survivors is a roguelike similar to Vampire Survivors featuring
          weapons that are generated at runtime based on the current level and
          character. Objectives must be completed to progress. After all
          objectives are completed, the player can return to their ship to
          complete a level.
        </p>

        <a
          href="/StarSurvivorsWindows.zip"
          download
          className="download-btn"
        >
          Download Star Survivors (Windows)
        </a>

        <h3 className="text-3xl font-semibold mb-2">Credits</h3>

        <ul className="credits-list">
          <li><strong>Colton Santiago</strong> – Levels, Objectives, Characters, XP System</li>
          <li><strong>Connor Hatfield</strong> – Genetic Algorithm (Weapons), Project Manager</li>
          <li><strong>Micah Ramirez</strong> – UI, Music</li>
          <li><strong>Anthony Vega</strong> – Enemies</li>

          <p className="credits-note">
            All in-game art was taken from free sources, credited below:
          </p>

          <details>
            <summary><strong>Level Design</strong></summary>
            <ul>
              <li>Spaceship – guardian5.itch.io</li>
              <li>Mars Background – vecteezy.com</li>
              <li>Neptune Background – vecteezy.com</li>
              <li>Payload Sprite – silverink.itch.io</li>
              <li>Crystal Sprite – creativekind.itch.io</li>
              <li>Jungle Assets – blank-canvas.itch.io</li>
            </ul>
          </details>

          <details>
            <summary><strong>Enemies</strong></summary>
            <ul>
              <li>Slime – rvros.itch.io</li>
              <li>Skeleton – monopixelart.itch.io</li>
              <li>Golems – monopixelart.itch.io</li>
              <li>Mushroom – monopixelart.itch.io</li>
            </ul>
          </details>

          <details>
            <summary><strong>Characters</strong></summary>
            <ul>
              <li>Astronaut – floatingkites.itch.io</li>
              <li>Ninja – cyberrumor.itch.io</li>
              <li>Knight – cyberrumor.itch.io</li>
            </ul>
          </details>

          <details>
            <summary><strong>Weapons</strong></summary>
            <ul>
              <li>Guns – ranitaya-studios.itch.io</li>
              <li>Melee – ranitaya-studios.itch.io</li>
            </ul>
          </details>

          <details>
            <summary><strong>Sound Effects</strong></summary>
            <ul>
              <li>Game Over – freesound.org</li>
              <li>UI – jdsherbert.itch.io</li>
              <li>Objective – YouTube</li>
              <li>SFX Generator – sfxr.me</li>
            </ul>
          </details>
        </ul>
      </section>
    </>
  );
}
