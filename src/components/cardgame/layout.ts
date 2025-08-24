// rows by index (unchanged)
export const row0 = [0, 1, 2];
export const row1 = [3, 4, 5, 6, 7, 8];
export const row2 = [9,10,11,12,13,14,15,16,17];
export const row3 = [18,19,20,21,22,23,24,25,26,27];

// grid column starts (unchanged)
export const row0Starts = [4, 10, 16];
export const row1Starts = [3, 5, 9, 11, 15, 17];
export const row2Starts = [2, 4, 6, 8, 10, 12, 14, 16, 18];
export const row3Starts = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

// --- NEW: build children map from the grid itself ---
function buildChildren(
  upperRow: number[], upperStarts: number[],
  lowerRow: number[], lowerStarts: number[]
) {
  const byStart = new Map<number, number>();
  lowerRow.forEach((idx, n) => byStart.set(lowerStarts[n], idx));

  const out: Record<number, number[]> = {};
  upperRow.forEach((idx, n) => {
    const s = upperStarts[n];
    // children live immediately below, starting one half-card left/right in our grid
    const left  = byStart.get(s - 1);
    const right = byStart.get(s + 1);
    out[idx] = [left, right].filter((v): v is number => typeof v === "number");
  });
  return out;
}

export const childrenMap: Record<number, number[]> = {
  // row0 -> row1
  ...buildChildren(row0, row0Starts, row1, row1Starts),
  // row1 -> row2
  ...buildChildren(row1, row1Starts, row2, row2Starts),
  // row2 -> row3
  ...buildChildren(row2, row2Starts, row3, row3Starts),
  // row3 -> none
  ...Object.fromEntries(row3.map(i => [i, []])),
};
