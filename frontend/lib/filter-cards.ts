import type { Card } from "./types";

export function matchesSearch(card: Card, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    card.title.toLowerCase().includes(q) ||
    card.details.toLowerCase().includes(q)
  );
}

export function filterColumnCards(
  cards: Card[],
  searchQuery: string,
  showArchived: boolean,
): Card[] {
  return cards.filter((card) => {
    if (card.archived && !showArchived) return false;
    return matchesSearch(card, searchQuery);
  });
}
