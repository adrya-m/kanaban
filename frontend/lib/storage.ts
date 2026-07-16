import { getDefaultBoard } from "./board-templates";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { AppPreferences, Board, BoardId, Card, CardLabel } from "./types";

const STORAGE_KEY = "kanban-boards-v2";
const LEGACY_STORAGE_KEY = "sundance-renovations-v1";
const PREFERENCES_ROW_ID = "shared";

export type StoredState = {
  boards: Record<BoardId, Board>;
  preferences: AppPreferences;
};

const defaultPreferences: AppPreferences = {
  activeBoardId: "sundance-renovations",
  darkMode: false,
  showArchived: false,
  searchQuery: "",
};

const BOARD_IDS: BoardId[] = ["sundance-renovations", "vacations-europe"];

function migrateCard(raw: Partial<Card> & { id: string; title: string }): Card {
  return {
    id: raw.id,
    title: raw.title,
    details: raw.details ?? "",
    label: (raw.label as CardLabel) ?? "none",
    dueDate: raw.dueDate ?? null,
    archived: raw.archived ?? false,
  };
}

function migrateBoard(
  raw: Partial<Board> & {
    columns: Board["columns"];
    cards: Record<string, Partial<Card> & { id: string; title: string }>;
  },
  fallbackId: BoardId,
): Board {
  const cards: Record<string, Card> = {};
  for (const [id, card] of Object.entries(raw.cards ?? {})) {
    cards[id] = migrateCard(card);
  }
  const template = getDefaultBoard(fallbackId);
  return {
    id: (raw.id as BoardId) ?? fallbackId,
    title: raw.title ?? template.title,
    columns: raw.columns,
    cards,
  };
}

function boardToRow(board: Board) {
  return {
    id: board.id,
    title: board.title,
    columns: board.columns,
    cards: board.cards,
    updated_at: new Date().toISOString(),
  };
}

function loadLocalState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacy) return null;
      const parsed = JSON.parse(legacy) as {
        board?: Partial<Board> & {
          columns: Board["columns"];
          cards: Record<string, Partial<Card> & { id: string; title: string }>;
        };
        preferences?: Partial<AppPreferences>;
      };
      if (!parsed.board?.columns) return null;
      return {
        boards: {
          "sundance-renovations": migrateBoard(
            parsed.board,
            "sundance-renovations",
          ),
          "vacations-europe": getDefaultBoard("vacations-europe"),
        },
        preferences: {
          activeBoardId: "sundance-renovations",
          darkMode: parsed.preferences?.darkMode ?? false,
          showArchived: parsed.preferences?.showArchived ?? false,
          searchQuery: "",
        },
      };
    }

    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!parsed.boards) return null;

    return {
      boards: {
        "sundance-renovations":
          parsed.boards["sundance-renovations"] != null
            ? migrateBoard(
                parsed.boards["sundance-renovations"],
                "sundance-renovations",
              )
            : getDefaultBoard("sundance-renovations"),
        "vacations-europe":
          parsed.boards["vacations-europe"] != null
            ? migrateBoard(parsed.boards["vacations-europe"], "vacations-europe")
            : getDefaultBoard("vacations-europe"),
      },
      preferences: {
        activeBoardId:
          parsed.preferences?.activeBoardId ?? defaultPreferences.activeBoardId,
        darkMode: parsed.preferences?.darkMode ?? false,
        showArchived: parsed.preferences?.showArchived ?? false,
        searchQuery: "",
      },
    };
  } catch {
    return null;
  }
}

function saveLocalState(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        boards: state.boards,
        preferences: {
          activeBoardId: state.preferences.activeBoardId,
          darkMode: state.preferences.darkMode,
          showArchived: state.preferences.showArchived,
        },
      }),
    );
  } catch {
    // ignore quota errors
  }
}

async function loadFromSupabase(): Promise<StoredState | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const [{ data: boardRows, error: boardsError }, { data: prefRow, error: prefError }] =
    await Promise.all([
      supabase.from("boards").select("id, title, columns, cards"),
      supabase
        .from("app_preferences")
        .select("active_board_id, dark_mode, show_archived")
        .eq("id", PREFERENCES_ROW_ID)
        .maybeSingle(),
    ]);

  if (boardsError || prefError) {
    console.error("Supabase load failed", boardsError ?? prefError);
    return null;
  }

  if (!boardRows || boardRows.length === 0) {
    const fresh = getFreshState();
    await saveToSupabase(fresh);
    return fresh;
  }

  const boards = { ...getFreshState().boards };
  for (const row of boardRows) {
    const id = row.id as BoardId;
    if (!BOARD_IDS.includes(id)) continue;
    boards[id] = migrateBoard(
      {
        id,
        title: row.title,
        columns: row.columns as Board["columns"],
        cards: row.cards as Board["cards"],
      },
      id,
    );
  }

  for (const id of BOARD_IDS) {
    if (!boardRows.some((row) => row.id === id)) {
      boards[id] = getDefaultBoard(id);
      await supabase.from("boards").upsert(boardToRow(boards[id]));
    }
  }

  return {
    boards,
    preferences: {
      activeBoardId: (prefRow?.active_board_id as BoardId) ?? "sundance-renovations",
      darkMode: prefRow?.dark_mode ?? false,
      showArchived: prefRow?.show_archived ?? false,
      searchQuery: "",
    },
  };
}

async function saveToSupabase(state: StoredState): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const rows = BOARD_IDS.map((id) => boardToRow(state.boards[id]));
  const { error: boardsError } = await supabase.from("boards").upsert(rows);
  if (boardsError) {
    console.error("Supabase board save failed", boardsError);
    return;
  }

  const { error: prefError } = await supabase.from("app_preferences").upsert({
    id: PREFERENCES_ROW_ID,
    active_board_id: state.preferences.activeBoardId,
    dark_mode: state.preferences.darkMode,
    show_archived: state.preferences.showArchived,
    updated_at: new Date().toISOString(),
  });
  if (prefError) {
    console.error("Supabase preferences save failed", prefError);
  }
}

export async function loadState(): Promise<StoredState | null> {
  if (isSupabaseConfigured()) {
    const remote = await loadFromSupabase();
    if (remote) return remote;
  }
  return loadLocalState();
}

export async function saveState(state: StoredState): Promise<void> {
  if (isSupabaseConfigured()) {
    await saveToSupabase(state);
    return;
  }
  saveLocalState(state);
}

export function createCard(
  title: string,
  details: string,
  label: CardLabel = "none",
  dueDate: string | null = null,
): Card {
  return {
    id: `card-${crypto.randomUUID()}`,
    title,
    details,
    label,
    dueDate,
    archived: false,
  };
}

export function getFreshState(): StoredState {
  return {
    boards: {
      "sundance-renovations": getDefaultBoard("sundance-renovations"),
      "vacations-europe": getDefaultBoard("vacations-europe"),
    },
    preferences: { ...defaultPreferences },
  };
}

export function getPersistenceMode(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
