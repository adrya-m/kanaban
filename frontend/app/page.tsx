"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Board } from "@/components/Board";
import { BoardHeader } from "@/components/BoardHeader";
import { BoardPlaceholder } from "@/components/BoardPlaceholder";
import { ClientOnly } from "@/components/ClientOnly";
import { boardTemplates } from "@/lib/board-templates";
import { boardReducer } from "@/lib/board-reducer";
import { getDefaultBoard } from "@/lib/dummy-data";
import {
  createCard,
  getFreshState,
  getPersistenceMode,
  loadState,
  saveState,
} from "@/lib/storage";
import type { AppPreferences, BoardAction, BoardId, CardLabel } from "@/lib/types";
import type { CardEditPayload } from "@/components/Card";

const UNDO_LIMIT = 30;
const SAVE_DEBOUNCE_MS = 500;

export default function Home() {
  const boardsRef = useRef(getFreshState().boards);
  const [activeBoardId, setActiveBoardId] =
    useState<BoardId>("sundance-renovations");
  const [board, dispatch] = useReducer(
    boardReducer,
    getDefaultBoard("sundance-renovations"),
  );
  const [preferences, setPreferences] = useState<AppPreferences>(
    getFreshState().preferences,
  );
  const [hydrated, setHydrated] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<"supabase" | "local">(
    "local",
  );
  const undoStack = useRef<(typeof board)[]>([]);
  const [undoCount, setUndoCount] = useState(0);

  const activeTemplate =
    boardTemplates.find((t) => t.id === activeBoardId) ?? boardTemplates[0];

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setPersistenceMode(getPersistenceMode());
      const stored = await loadState();
      if (cancelled) return;
      if (stored) {
        boardsRef.current = stored.boards;
        const id = stored.preferences.activeBoardId;
        setActiveBoardId(id);
        dispatch({ type: "SET_BOARD", board: stored.boards[id] });
        setPreferences((prev) => ({
          ...prev,
          activeBoardId: id,
          darkMode: stored.preferences.darkMode,
          showArchived: stored.preferences.showArchived,
        }));
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    boardsRef.current[activeBoardId] = board;

    const timer = setTimeout(() => {
      void saveState({
        boards: boardsRef.current,
        preferences: {
          activeBoardId,
          darkMode: preferences.darkMode,
          showArchived: preferences.showArchived,
          searchQuery: "",
        },
      });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    board,
    activeBoardId,
    preferences.darkMode,
    preferences.showArchived,
    hydrated,
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", preferences.darkMode);
  }, [preferences.darkMode]);

  useEffect(() => {
    document.documentElement.dataset.board = activeBoardId;
  }, [activeBoardId]);

  const trackUndo = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-(UNDO_LIMIT - 1)), board];
    setUndoCount(undoStack.current.length);
  }, [board]);

  const runAction = useCallback(
    (action: BoardAction) => {
      trackUndo();
      dispatch(action);
    },
    [trackUndo],
  );

  function handleUndo() {
    const previous = undoStack.current.pop();
    if (previous) {
      dispatch({ type: "SET_BOARD", board: previous });
      setUndoCount(undoStack.current.length);
    }
  }

  function switchBoard(id: BoardId) {
    if (id === activeBoardId) return;
    boardsRef.current[activeBoardId] = board;
    setActiveBoardId(id);
    dispatch({ type: "SET_BOARD", board: boardsRef.current[id] });
    setPreferences((prev) => ({ ...prev, activeBoardId: id, searchQuery: "" }));
    undoStack.current = [];
    setUndoCount(0);
  }

  function handleAddCard(
    columnId: string,
    title: string,
    details: string,
    label: CardLabel,
    dueDate: string | null,
  ) {
    runAction({
      type: "ADD_CARD",
      columnId,
      card: createCard(title, details, label, dueDate),
    });
  }

  function handleEditCard(cardId: string, payload: CardEditPayload) {
    runAction({
      type: "EDIT_CARD",
      cardId,
      ...payload,
    });
  }

  return (
    <div
      className="flex min-h-full flex-col"
      data-testid={hydrated ? "app-ready" : "app-loading"}
      data-persistence={persistenceMode}
    >
      <BoardHeader
        title={board.title}
        subtitle={activeTemplate.subtitle}
        boardId={activeBoardId}
        boards={boardTemplates.map((t) => ({ id: t.id, title: t.title }))}
        searchQuery={preferences.searchQuery}
        darkMode={preferences.darkMode}
        showArchived={preferences.showArchived}
        canUndo={undoCount > 0}
        persistenceMode={persistenceMode}
        onBoardChange={switchBoard}
        onTitleChange={(title) => runAction({ type: "SET_BOARD_TITLE", title })}
        onSearchChange={(searchQuery) =>
          setPreferences((prev) => ({ ...prev, searchQuery }))
        }
        onToggleDarkMode={() =>
          setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }))
        }
        onToggleArchived={() =>
          setPreferences((prev) => ({
            ...prev,
            showArchived: !prev.showArchived,
          }))
        }
        onUndo={handleUndo}
      />
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <ClientOnly fallback={<BoardPlaceholder board={board} />}>
          <Board
            board={board}
            boardId={activeBoardId}
            searchQuery={preferences.searchQuery}
            showArchived={preferences.showArchived}
            onRenameColumn={(columnId, title) =>
              runAction({ type: "RENAME_COLUMN", columnId, title })
            }
            onMoveColumn={(columnId, toIndex) =>
              runAction({ type: "MOVE_COLUMN", columnId, toIndex })
            }
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={(columnId, cardId) =>
              runAction({ type: "DELETE_CARD", columnId, cardId })
            }
            onArchiveCard={(columnId, cardId) =>
              runAction({ type: "ARCHIVE_CARD", columnId, cardId })
            }
            onRestoreCard={(columnId, cardId) =>
              runAction({ type: "RESTORE_CARD", columnId, cardId })
            }
            onMoveCard={(cardId, fromColumnId, toColumnId, toIndex) =>
              runAction({
                type: "MOVE_CARD",
                cardId,
                fromColumnId,
                toColumnId,
                toIndex,
              })
            }
          />
        </ClientOnly>
      </main>
    </div>
  );
}
