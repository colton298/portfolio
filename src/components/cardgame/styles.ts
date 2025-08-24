// Exact same CSS as the inline <style> from the original component.
export const CARDGAME_CSS = `
  .felt { background: #2d7a38 radial-gradient(ellipse at 50% 50%, #3aa047 0%, #226c30 70%) no-repeat; }

  /* Container-scoped size variables so stock/waste match tableau */
  .tp-container {
    position: relative;
    padding: 24px;
    padding-bottom: 48px;
    --card-w: 78px;
    --card-h: 108px;
    --half: calc(var(--card-w) / 2);
    --col-gap: 14px;
    --row-gap: 26px;
    --overlap-step: 16px;
  }

  .tp-grid  { position: relative; z-index: 1; }

  /* ==== Controls row (center the waste exactly) ==== */
  .stockbar {
    position: relative;
    z-index: 5;
    display: grid;
    grid-template-columns: 1fr var(--card-w) 1fr;
    align-items: center;
    column-gap: 16px;
    justify-items: stretch;
    /* keep a comfortable gap under the tableau */
    margin-top: calc(var(--card-h) - var(--row-gap) + (var(--overlap-step) * 2) + 24px);
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
  .stockbar .left  { justify-self: end; }
  .stockbar .right { justify-self: start; }

  .stockbar .waste {
    width: var(--card-w);
    height: var(--card-h);
    display: flex;
    align-items: center;
    justify-content: center;
    /* middle column, fixed width = perfectly centered under the middle peak */
    grid-column: 2;
  }
  /* Neutralize tableau overlap for controls row */
  .stockbar .tp-card { transform: none; }

  /* Tableau grid (19 columns; each card spans 2) */
  .tp-grid {
    --card-w: 78px;
    --card-h: 108px;
    --half: calc(var(--card-w) / 2);
    --col-gap: 14px;
    --row-gap: 26px;
    --overlap-step: 16px;

    display: grid;
    grid-template-columns: repeat(19, var(--half));
    grid-template-rows: repeat(4, var(--row-gap));
    justify-content: center;
    column-gap: var(--col-gap);
    row-gap: var(--row-gap);
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Card base */
  .tp-card {
    width: var(--card-w);
    height: var(--card-h);
    border-radius: 12px;
    box-shadow: 0 10px 18px rgba(0,0,0,0.35);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    letter-spacing: 0.5px;
    user-select: none;
    transform: translateY(calc(-1 * var(--overlap-step)));
    transition: transform 120ms ease, opacity 120ms ease;
  }
  .tp-card.faceup { background: var(--panel, #111); }
  .tp-card.facedown {
    background:
      linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%),
      linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%);
    background-size: 12px 12px;
    background-position: 0 0, 6px 6px;
    background-color: #2a2a5a;
  }
  .tp-card.playable { outline: 2px solid var(--accent, #6cf); cursor: pointer; }
  .tp-card.disabled { opacity: 0.35; cursor: default; }
  .tp-card.removed { visibility: hidden; }
  .tp-card.playable:hover { transform: translateY(calc(-1 * var(--overlap-step) - 3px)) !important; }
`;
