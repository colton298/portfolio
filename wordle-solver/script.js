let WORDS = [];

fetch("words.txt")
  .then(response => response.text())
  .then(text => {
    WORDS = text
      .replace(/\r/g, '') // remove Windows-style carriage returns
      .split("\n")
      .map(word => word.trim().toLowerCase())
      .filter(w => w.length === 5);
    document.getElementById("solverForm").disabled = false;
  })
  .catch(err => {
    console.error("Failed to load word list:", err);
  });

function parseYellow(input) {
  const result = {};
  if (!input.trim()) return result;
  const pairs = input.split(',');
  for (let pair of pairs) {
    const letter = pair[0].toLowerCase();
    const index = parseInt(pair[1]);
    if (!result[letter]) result[letter] = [];
    result[letter].push(index);
  }
  return result;
}

document.getElementById("solverForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (WORDS.length === 0) {
    alert("Word list not loaded yet. Please try again in a moment.");
    return;
  }

  const green = document.getElementById("green").value.toLowerCase();
  const yellowRaw = document.getElementById("yellow").value;
  const gray = document.getElementById("gray").value.toLowerCase();

  const yellow = parseYellow(yellowRaw);
  const graySet = new Set(gray.split('').filter(l => l));

  const results = [];

  for (const word of WORDS) {
    let match = true;

    // Green match
    for (let i = 0; i < 5; i++) {
      if (green[i] !== "_" && green[i] !== word[i]) {
        match = false;
        break;
      }
    }

    if (!match) continue;

    // Yellow match
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

    // Gray letters (exclude only if not in green/yellow context)
    const greenLetters = new Set(green.split('').filter(l => l !== "_"));
    const yellowLetters = new Set(Object.keys(yellow));
    for (const l of graySet) {
      if ((word.includes(l)) && !greenLetters.has(l) && !yellowLetters.has(l)) {
        match = false;
        break;
      }
    }

    if (match) results.push(word);
  }

  const list = document.getElementById("results");
  list.innerHTML = results.length
    ? results.map(word => `<li>${word}</li>`).join('')
    : "<li>No matches found</li>";
});
