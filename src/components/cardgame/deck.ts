import type { Card, Suit } from "./types";

export const suitSymbols: Suit[] = ["♠", "♥", "♦", "♣"];

export const rankLabel = (r: number) =>
  r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r);

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suitSymbols) {
    for (let r = 1 as Card["rank"]; r <= 13; r++) {
      const id = `${r}${suit}-${Math.random().toString(36).slice(2, 8)}`;
      deck.push({ rank: r as Card["rank"], suit, id });
    }
  }
  return deck;
}

export function shuffle<T>(a: T[]): T[] {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isAdjacentRank(a: number, b: number) {
  if (a === 13 && b === 1) return true;
  if (a === 1 && b === 13) return true;
  return Math.abs(a - b) === 1;
}
