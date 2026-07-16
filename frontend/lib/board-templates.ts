import type { Board, BoardId } from "./types";

export type BoardTemplate = {
  id: BoardId;
  title: string;
  subtitle: string;
  board: Board;
};

export const sundanceRenovationsBoard: Board = {
  id: "sundance-renovations",
  title: "Sundance Renovations",
  columns: [
    { id: "col-backlog", title: "Planning", cardIds: ["card-1", "card-2"] },
    { id: "col-todo", title: "Scheduled", cardIds: ["card-3", "card-4", "card-5"] },
    { id: "col-progress", title: "On Site", cardIds: ["card-6", "card-7"] },
    { id: "col-review", title: "Inspection", cardIds: ["card-8"] },
    { id: "col-done", title: "Complete", cardIds: ["card-9", "card-10"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Site assessment",
      details: "Walk the property and document scope for the main floor renovation.",
      label: "urgent",
      dueDate: null,
      archived: false,
    },
    "card-2": {
      id: "card-2",
      title: "Select flooring",
      details: "Compare engineered hardwood options for the living and dining areas.",
      label: "materials",
      dueDate: null,
      archived: false,
    },
    "card-3": {
      id: "card-3",
      title: "Order kitchen cabinets",
      details: "Confirm measurements and place order with the cabinet supplier.",
      label: "materials",
      dueDate: null,
      archived: false,
    },
    "card-4": {
      id: "card-4",
      title: "Schedule electrician",
      details: "Book rough-in wiring for new recessed lighting and outlet relocations.",
      label: "none",
      dueDate: null,
      archived: false,
    },
    "card-5": {
      id: "card-5",
      title: "Submit permit paperwork",
      details: "File renovation permits with the city before demolition begins.",
      label: "permits",
      dueDate: null,
      archived: false,
    },
    "card-6": {
      id: "card-6",
      title: "Demolish old bathroom",
      details: "Remove existing vanity, tile, and shower surround down to studs.",
      label: "urgent",
      dueDate: null,
      archived: false,
    },
    "card-7": {
      id: "card-7",
      title: "Install new windows",
      details: "Replace front-facing windows with energy-efficient double-pane units.",
      label: "materials",
      dueDate: null,
      archived: false,
    },
    "card-8": {
      id: "card-8",
      title: "Paint living room",
      details: "Two coats on walls and trim; verify color match with client samples.",
      label: "none",
      dueDate: null,
      archived: false,
    },
    "card-9": {
      id: "card-9",
      title: "Refinish hardwood floors",
      details: "Sand, stain, and seal main-level flooring after cabinet install.",
      label: "none",
      dueDate: null,
      archived: false,
    },
    "card-10": {
      id: "card-10",
      title: "Landscaping cleanup",
      details: "Remove construction debris and restore front walkway plantings.",
      label: "none",
      dueDate: null,
      archived: false,
    },
  },
};

export const vacationsEuropeBoard: Board = {
  id: "vacations-europe",
  title: "Vacations in Europe",
  columns: [
    { id: "col-backlog", title: "Wishlist", cardIds: ["vac-1", "vac-2"] },
    { id: "col-todo", title: "Planning", cardIds: ["vac-3", "vac-4", "vac-5"] },
    { id: "col-progress", title: "Booked", cardIds: ["vac-6", "vac-7"] },
    { id: "col-review", title: "Packing", cardIds: ["vac-8"] },
    { id: "col-done", title: "Completed", cardIds: ["vac-9", "vac-10"] },
  ],
  cards: {
    "vac-1": {
      id: "vac-1",
      title: "Amalfi Coast road trip",
      details: "Drive Naples to Positano with stops in Ravello and Amalfi.",
      label: "none",
      dueDate: null,
      archived: false,
    },
    "vac-2": {
      id: "vac-2",
      title: "Swiss Alps hiking",
      details: "Research trails near Interlaken and Zermatt for summer trekking.",
      label: "none",
      dueDate: null,
      archived: false,
    },
    "vac-3": {
      id: "vac-3",
      title: "Paris long weekend",
      details: "Louvre, Montmartre, Seine cruise, and a bistro in Le Marais.",
      label: "urgent",
      dueDate: null,
      archived: false,
    },
    "vac-4": {
      id: "vac-4",
      title: "Barcelona architecture tour",
      details: "Sagrada Familia tickets, Park Guell, and Gothic Quarter walk.",
      label: "materials",
      dueDate: null,
      archived: false,
    },
    "vac-5": {
      id: "vac-5",
      title: "Schengen visa check",
      details: "Confirm passport validity and entry requirements for EU travel.",
      label: "permits",
      dueDate: null,
      archived: false,
    },
    "vac-6": {
      id: "vac-6",
      title: "Rome hotel booked",
      details: "Four nights near Trastevere; walking distance to Vatican City.",
      label: "materials",
      dueDate: null,
      archived: false,
    },
    "vac-7": {
      id: "vac-7",
      title: "Flights to Lisbon",
      details: "Round-trip confirmed with a layover in Madrid.",
      label: "materials",
      dueDate: null,
      archived: false,
    },
    "vac-8": {
      id: "vac-8",
      title: "Pack carry-on essentials",
      details: "Adapters, walking shoes, light rain jacket, and travel insurance docs.",
      label: "urgent",
      dueDate: null,
      archived: false,
    },
    "vac-9": {
      id: "vac-9",
      title: "Prague Christmas markets",
      details: "Visited Old Town Square, Charles Bridge, and local mulled wine stalls.",
      label: "none",
      dueDate: null,
      archived: false,
    },
    "vac-10": {
      id: "vac-10",
      title: "Amsterdam canal cruise",
      details: "Evening boat tour through the Jordaan district.",
      label: "none",
      dueDate: null,
      archived: false,
    },
  },
};

export const boardTemplates: BoardTemplate[] = [
  {
    id: "sundance-renovations",
    title: "Sundance Renovations",
    subtitle: "Track every phase of your renovation from planning to completion",
    board: sundanceRenovationsBoard,
  },
  {
    id: "vacations-europe",
    title: "Vacations in Europe",
    subtitle: "Plan dream trips, book adventures, and track every stop along the way",
    board: vacationsEuropeBoard,
  },
];

export function getBoardTemplate(id: BoardId): BoardTemplate {
  return boardTemplates.find((t) => t.id === id) ?? boardTemplates[0];
}

export function getDefaultBoard(id: BoardId = "sundance-renovations"): Board {
  return structuredClone(getBoardTemplate(id).board);
}

/** @deprecated use getDefaultBoard("sundance-renovations") */
export const dummyBoard = sundanceRenovationsBoard;
