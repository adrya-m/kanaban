import type { Board, BoardAction } from "./types";

export function boardReducer(state: Board, action: BoardAction): Board {
  switch (action.type) {
    case "SET_BOARD":
      return action.board;

    case "SET_BOARD_TITLE":
      return { ...state, title: action.title };

    case "RENAME_COLUMN":
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.columnId
            ? { ...column, title: action.title }
            : column,
        ),
      };

    case "MOVE_COLUMN": {
      const fromIndex = state.columns.findIndex((c) => c.id === action.columnId);
      if (fromIndex === -1 || action.toIndex < 0 || action.toIndex >= state.columns.length) {
        return state;
      }
      const columns = [...state.columns];
      const [column] = columns.splice(fromIndex, 1);
      columns.splice(action.toIndex, 0, column);
      return { ...state, columns };
    }

    case "ADD_CARD": {
      const { columnId, card } = action;
      return {
        ...state,
        cards: { ...state.cards, [card.id]: card },
        columns: state.columns.map((column) =>
          column.id === columnId
            ? { ...column, cardIds: [...column.cardIds, card.id] }
            : column,
        ),
      };
    }

    case "EDIT_CARD": {
      const { cardId, title, details, label, dueDate } = action;
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, title, details, label, dueDate },
        },
      };
    }

    case "ARCHIVE_CARD": {
      const { cardId } = action;
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, archived: true },
        },
      };
    }

    case "RESTORE_CARD": {
      const { cardId } = action;
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, archived: false },
        },
      };
    }

    case "DELETE_CARD": {
      const { columnId, cardId } = action;
      const remainingCards = { ...state.cards };
      delete remainingCards[cardId];
      return {
        ...state,
        cards: remainingCards,
        columns: state.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cardIds: column.cardIds.filter((id) => id !== cardId),
              }
            : column,
        ),
      };
    }

    case "MOVE_CARD": {
      const { cardId, fromColumnId, toColumnId, toIndex } = action;
      const fromColumn = state.columns.find((c) => c.id === fromColumnId);
      const toColumn = state.columns.find((c) => c.id === toColumnId);
      if (!fromColumn || !toColumn) return state;

      const fromIndex = fromColumn.cardIds.indexOf(cardId);
      if (fromIndex === -1) return state;

      if (fromColumnId === toColumnId) {
        const newCardIds = [...fromColumn.cardIds];
        newCardIds.splice(toIndex, 0, newCardIds.splice(fromIndex, 1)[0]);
        return {
          ...state,
          columns: state.columns.map((column) =>
            column.id === fromColumnId
              ? { ...column, cardIds: newCardIds }
              : column,
          ),
        };
      }

      const newFromCardIds = fromColumn.cardIds.filter((id) => id !== cardId);
      const newToCardIds = [...toColumn.cardIds];
      newToCardIds.splice(toIndex, 0, cardId);

      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id === fromColumnId) {
            return { ...column, cardIds: newFromCardIds };
          }
          if (column.id === toColumnId) {
            return { ...column, cardIds: newToCardIds };
          }
          return column;
        }),
      };
    }

    default:
      return state;
  }
}
