let WORDS = [];

fetch("words.txt")
  .then(response => response.text())
  .then(text => {
    WORDS = text
      .replace(/\r/g, '')
      .split("\n")
      .map(word => word.trim().toLowerCase())
      .filter(w => w.length === 5);
    document.getElementById("solverForm").disabled = false;
  })
  .catch(err => {
    console.error("Failed to load word list:", err);
  });

function getGreenPattern() {
  const greenBoxes = document.querySelectorAll(".green");
  return Array.from(greenBoxes)
    .map(b => b.value.trim().toLowerCase() || "_")
    .join("");
}

function getYellowMap() {
  const yellowBoxes = document.querySelectorAll(".yellow");
  const yellow = {};
  yellowBoxes.forEach((box, index) => {
    const letter = box.value.trim().toLowerCase();
    if (letter) {
      if (!yellow[letter]) yellow[letter] = [];
      yellow[letter].push(index);
    }
  });
  return yellow;
}

document.getElementById("solverForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (WORDS.length === 0) {
    alert("Word list not loaded yet. Please try again in a moment.");
    return;
  }

  const loading = document.getElementById("loading");
  const list = document.getElementById("results");

  // Show spinner and clear old results
  loading.style.display = "block";
  list.innerHTML = "";

  // Small delay to allow spinner to render
  await new Promise((r) => setTimeout(r, 100));

  const green = getGreenPattern();
  const yellow = getYellowMap();
  const gray = document.getElementById("gray").value.toLowerCase();
  const graySet = new Set(gray.split('').filter(Boolean));

  const greenLetters = new Set(green.split('').filter(l => l !== "_"));
  const yellowLetters = new Set(Object.keys(yellow));

  const results = [];

  for (const word of WORDS) {
    let match = true;

    // Green letter match
    for (let i = 0; i < 5; i++) {
      if (green[i] !== "_" && green[i] !== word[i]) {
        match = false;
        break;
      }
    }

    if (!match) continue;

    // Yellow letter match
    for (const [letter, indices] of Object.entries(yellow)) {
      if (!word.includes(letter)) {
        match = false;
        break;
      }
      for (const i of indices) {
        if (word[i] === letter) {
          match = false;
          break;
        }
      }
    }

    if (!match) continue;

    // Gray letter exclusion
    for (const l of graySet) {
      if (word.includes(l) && !greenLetters.has(l) && !yellowLetters.has(l)) {
        match = false;
        break;
      }
    }

    if (match) results.push(word);
  }

  // Keep loading visible for a minimum time
  await new Promise((r) => setTimeout(r, 300));
  loading.style.display = "none";

  list.innerHTML = results.length
    ? results.map(w => `<li>${w}</li>`).join("")
    : "<li>No matches found</li>";
});

function setupAutoAdvance(selector) {
  const boxes = document.querySelectorAll(selector);
  boxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      const val = box.value;
      if (val.length === 1 && i < boxes.length - 1) {
        boxes[i + 1].focus();
      }
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && box.value === "" && i > 0) {
        boxes[i - 1].focus();
      }
    });
  });
}

setupAutoAdvance(".green");
setupAutoAdvance(".yellow");
