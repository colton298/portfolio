export type Suit = "♠" | "♥" | "♦" | "♣";

export type Card = {
  rank: 1|2|3|4|5|6|7|8|9|10|11|12|13;
  suit: Suit;
  id: string;
};

export type TableauCard = { card: Card; removed: boolean };
