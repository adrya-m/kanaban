export type BoardId = "sundance-renovations" | "vacations-europe";

export type CardLabel = "none" | "urgent" | "materials" | "permits";

export type Card = {
  id: string;
  title: string;
  details: string;
  label: CardLabel;
  dueDate: string | null;
  archived: boolean;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type Board = {
  id: BoardId;
  title: string;
  columns: Column[];
  cards: Record<string, Card>;
};

export type AppPreferences = {
  activeBoardId: BoardId;
  darkMode: boolean;
  showArchived: boolean;
  searchQuery: string;
};

export type BoardAction =
  | { type: "SET_BOARD"; board: Board }
  | { type: "SET_BOARD_TITLE"; title: string }
  | { type: "RENAME_COLUMN"; columnId: string; title: string }
  | { type: "MOVE_COLUMN"; columnId: string; toIndex: number }
  | { type: "ADD_CARD"; columnId: string; card: Card }
  | {
      type: "EDIT_CARD";
      cardId: string;
      title: string;
      details: string;
      label: CardLabel;
      dueDate: string | null;
    }
  | { type: "DELETE_CARD"; columnId: string; cardId: string }
  | { type: "ARCHIVE_CARD"; columnId: string; cardId: string }
  | { type: "RESTORE_CARD"; columnId: string; cardId: string }
  | {
      type: "MOVE_CARD";
      cardId: string;
      fromColumnId: string;
      toColumnId: string;
      toIndex: number;
    };
