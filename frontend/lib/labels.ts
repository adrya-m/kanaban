import type { BoardId, CardLabel } from "./types";

const LABEL_STYLES: Record<
  CardLabel,
  { pill: string; pillDark: string }
> = {
  none: { pill: "", pillDark: "" },
  urgent: {
    pill: "bg-red-100 text-red-700",
    pillDark: "dark:bg-red-900/40 dark:text-red-300",
  },
  materials: {
    pill: "bg-sky-100 text-sky-700",
    pillDark: "dark:bg-sky-900/40 dark:text-sky-300",
  },
  permits: {
    pill: "bg-purple-100 text-purple-700",
    pillDark: "dark:bg-purple-900/40 dark:text-purple-300",
  },
};

const LABEL_NAMES: Record<BoardId, Record<CardLabel, string>> = {
  "sundance-renovations": {
    none: "No label",
    urgent: "Urgent",
    materials: "Materials",
    permits: "Permits",
  },
  "vacations-europe": {
    none: "No label",
    urgent: "Time-sensitive",
    materials: "Flights & hotels",
    permits: "Visas & docs",
  },
};

export type LabelOption = {
  value: CardLabel;
  name: string;
  pill: string;
  pillDark: string;
};

export function getCardLabels(boardId: BoardId): LabelOption[] {
  return (["none", "urgent", "materials", "permits"] as CardLabel[]).map(
    (value) => ({
      value,
      name: LABEL_NAMES[boardId][value],
      ...LABEL_STYLES[value],
    }),
  );
}

export function getLabelConfig(label: CardLabel, boardId: BoardId): LabelOption {
  return (
    getCardLabels(boardId).find((l) => l.value === label) ??
    getCardLabels(boardId)[0]
  );
}

/** @deprecated use getCardLabels(boardId) */
export const CARD_LABELS = getCardLabels("sundance-renovations");
