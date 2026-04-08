import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { nanoid } from "nanoid";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOLIDAYS = {
  "1-1": "New Year's Day",
  "1-26": "Republic Day",
  "3-14": "Holi",
  "4-14": "Ambedkar Jayanti",
  "5-1": "Labour Day",
  "8-15": "Independence Day",
  "8-19": "Janmashtami",
  "9-7": "Ganesh Chaturthi",
  "10-2": "Gandhi Jayanti",
  "10-24": "Dussehra",
  "11-1": "Diwali",
  "12-25": "Christmas",
};

export const MONTH_GRADIENTS = [
  "linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 50%, #a8d8f0 100%)",
  "linear-gradient(135deg, #3d1a3a 0%, #8b4882 50%, #e8b4e0 100%)",
  "linear-gradient(135deg, #1a3d1a 0%, #4a8f4a 50%, #b4e8b4 100%)",
  "linear-gradient(135deg, #1a2d10 0%, #5a8f30 50%, #c8e890 100%)",
  "linear-gradient(135deg, #3d2805 0%, #b86010 50%, #f5d070 100%)",
  "linear-gradient(135deg, #3d1805 0%, #c05020 50%, #f5a070 100%)",
  "linear-gradient(135deg, #3d0808 0%, #c02828 50%, #f08080 100%)",
  "linear-gradient(135deg, #3d2200 0%, #a85800 50%, #e8b060 100%)",
  "linear-gradient(135deg, #2d1a08 0%, #8a4810 50%, #d8a060 100%)",
  "linear-gradient(135deg, #3d1800 0%, #b04010 50%, #f07030 100%)",
  "linear-gradient(135deg, #1a1208 0%, #605030 50%, #c0a878 100%)",
  "linear-gradient(135deg, #081828 0%, #205878 50%, #90c8e8 100%)",
];

export function getHoliday(date) {
  const key = `${date.getMonth() + 1}-${date.getDate()}`;
  return HOLIDAYS[key] || null;
}

export function formatDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isInRange(date, start, end) {
  if (!start || !end || !date) return false;
  const t = date.getTime();
  const lo = Math.min(start.getTime(), end.getTime());
  const hi = Math.max(start.getTime(), end.getTime());
  return t > lo && t < hi;
}

export function getRangeDiff(start, end) {
  if (!start || !end) return 0;
  return Math.abs(Math.round((end.getTime() - start.getTime()) / 86400000));
}

export function buildCalendarGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ date: new Date(year, month, day), isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    cells.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
  }
  return cells;
}

export function getMonthName(month) {
  return MONTHS[month].toLowerCase();
}

const STORAGE_KEY = "calendar_notes_v2";

function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

const today = new Date();

function buildInitialState() {
  const saved = loadSavedData();
  return {
    currentMonth: today.getMonth(),
    currentYear: today.getFullYear(),
    rangeStart: null,
    rangeEnd: null,
    isSelecting: false,
    hoveredDate: null,

    dayNotes: saved?.dayNotes || {},
    rangeNotes: saved?.rangeNotes || {},
    monthMemo: saved?.monthMemo || {},

    activeNoteKey: null,
    notesPanelOpen: true,
    animDir: null,
    theme: "dark",
  };
}

function calendarReducer(state, action) {
  switch (action.type) {
    case "PREV_MONTH": {
      let month = state.currentMonth - 1;
      let year = state.currentYear;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      return {
        ...state,
        currentMonth: month,
        currentYear: year,
        animDir: "right",
      };
    }

    case "NEXT_MONTH": {
      let month = state.currentMonth + 1;
      let year = state.currentYear;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      return {
        ...state,
        currentMonth: month,
        currentYear: year,
        animDir: "left",
      };
    }

    case "GOTO_TODAY":
      return {
        ...state,
        currentMonth: today.getMonth(),
        currentYear: today.getFullYear(),
        animDir: null,
      };

    case "GOTO_MONTH_YEAR":
      return {
        ...state,
        currentMonth: action.month,
        currentYear: action.year,
        animDir: null,
      };

    case "SELECT_DATE": {
      const { date } = action;
      if (!state.isSelecting) {
        return {
          ...state,
          isSelecting: true,
          rangeStart: date,
          rangeEnd: null,
          activeNoteKey: formatDate(date),
        };
      }
      if (isSameDay(state.rangeStart, date)) {
        return {
          ...state,
          isSelecting: false,
          rangeEnd: null,
          activeNoteKey: formatDate(state.rangeStart),
        };
      }
      const start = state.rangeStart < date ? state.rangeStart : date;
      const end = state.rangeStart < date ? date : state.rangeStart;
      return {
        ...state,
        isSelecting: false,
        rangeStart: start,
        rangeEnd: end,
        activeNoteKey: null,
      };
    }

    case "CLEAR_RANGE":
      return {
        ...state,
        rangeStart: null,
        rangeEnd: null,
        isSelecting: false,
        activeNoteKey: null,
      };

    case "SET_HOVERED":
      return { ...state, hoveredDate: action.date };

    case "ADD_DAY_NOTE": {
      const existing = state.dayNotes[action.dateKey] || [];
      const updated = [
        ...existing,
        { id: nanoid(8), text: action.text, savedAt: Date.now() },
      ];
      return {
        ...state,
        dayNotes: { ...state.dayNotes, [action.dateKey]: updated },
      };
    }

    case "DELETE_DAY_NOTE": {
      const existing = state.dayNotes[action.dateKey] || [];
      const updated = existing.filter((n) => n.id !== action.noteId);
      const dayNotes = { ...state.dayNotes };
      if (updated.length === 0) {
        delete dayNotes[action.dateKey];
      } else {
        dayNotes[action.dateKey] = updated;
      }
      return { ...state, dayNotes };
    }

    case "UPDATE_DAY_NOTE": {
      const existing = state.dayNotes[action.dateKey] || [];
      const updated = existing.map((n) =>
        n.id === action.noteId
          ? { ...n, text: action.text, updatedAt: Date.now() }
          : n,
      );
      return {
        ...state,
        dayNotes: { ...state.dayNotes, [action.dateKey]: updated },
      };
    }

    case "SET_MONTH_MEMO": {
      const monthMemo = { ...state.monthMemo, [action.key]: action.value };
      if (!action.value) delete monthMemo[action.key];
      return { ...state, monthMemo };
    }

    case "ADD_RANGE_NOTE": {
      const existing = state.rangeNotes[action.rangeKey] || [];
      const updated = [
        ...existing,
        { id: nanoid(8), ...action.note, savedAt: Date.now() },
      ];
      return {
        ...state,
        rangeNotes: { ...state.rangeNotes, [action.rangeKey]: updated },
      };
    }

    case "DELETE_RANGE_NOTE": {
      const existing = state.rangeNotes[action.rangeKey] || [];
      const updated = existing.filter((n) => n.id !== action.noteId);
      const rangeNotes = { ...state.rangeNotes };
      if (updated.length === 0) {
        delete rangeNotes[action.rangeKey];
      } else {
        rangeNotes[action.rangeKey] = updated;
      }
      return { ...state, rangeNotes };
    }

    case "UPDATE_RANGE_NOTE": {
      const existing = state.rangeNotes[action.rangeKey] || [];
      const updated = existing.map((n) =>
        n.id === action.noteId
          ? { ...n, ...action.fields, updatedAt: Date.now() }
          : n,
      );
      return {
        ...state,
        rangeNotes: { ...state.rangeNotes, [action.rangeKey]: updated },
      };
    }

    case "SET_ACTIVE_NOTE":
      return { ...state, activeNoteKey: action.key };

    case "TOGGLE_NOTES_PANEL":
      return { ...state, notesPanelOpen: !state.notesPanelOpen };

    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };

    case "RESTORE_DAY_SELECTION": {
      const date = new Date(`${action.dateKey}T00:00:00`);
      return {
        ...state,
        rangeStart: date,
        rangeEnd: null,
        isSelecting: false,
        activeNoteKey: action.dateKey,
      };
    }

    case "RESTORE_RANGE_SELECTION": {
      const start = new Date(`${action.startKey}T00:00:00`);
      const end = new Date(`${action.endKey}T00:00:00`);
      return {
        ...state,
        rangeStart: start,
        rangeEnd: end,
        isSelecting: false,
        activeNoteKey: null,
      };
    }

    default:
      return state;
  }
}

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  const [state, dispatch] = useReducer(
    calendarReducer,
    null,
    buildInitialState,
  );

  useEffect(() => {
    persistData({
      dayNotes: state.dayNotes,
      rangeNotes: state.rangeNotes,
      monthMemo: state.monthMemo,
    });
  }, [state.dayNotes, state.rangeNotes, state.monthMemo]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const prevMonth = useCallback(() => dispatch({ type: "PREV_MONTH" }), []);
  const nextMonth = useCallback(() => dispatch({ type: "NEXT_MONTH" }), []);
  const gotoToday = useCallback(() => dispatch({ type: "GOTO_TODAY" }), []);
  const gotoMonthYear = useCallback(
    (m, y) => dispatch({ type: "GOTO_MONTH_YEAR", month: m, year: y }),
    [],
  );
  const selectDate = useCallback(
    (date) => dispatch({ type: "SELECT_DATE", date }),
    [],
  );
  const clearRange = useCallback(() => dispatch({ type: "CLEAR_RANGE" }), []);
  const setHovered = useCallback(
    (date) => dispatch({ type: "SET_HOVERED", date }),
    [],
  );
  const setActiveNote = useCallback(
    (key) => dispatch({ type: "SET_ACTIVE_NOTE", key }),
    [],
  );
  const toggleNotesPanel = useCallback(
    () => dispatch({ type: "TOGGLE_NOTES_PANEL" }),
    [],
  );
  const toggleTheme = useCallback(() => dispatch({ type: "TOGGLE_THEME" }), []);

  const addDayNote = useCallback(
    (dateKey, text) => dispatch({ type: "ADD_DAY_NOTE", dateKey, text }),
    [],
  );
  const deleteDayNote = useCallback(
    (dateKey, noteId) => dispatch({ type: "DELETE_DAY_NOTE", dateKey, noteId }),
    [],
  );
  const updateDayNote = useCallback(
    (dateKey, noteId, text) =>
      dispatch({ type: "UPDATE_DAY_NOTE", dateKey, noteId, text }),
    [],
  );
  const setMonthMemo = useCallback(
    (key, value) => dispatch({ type: "SET_MONTH_MEMO", key, value }),
    [],
  );
  const addRangeNote = useCallback(
    (rangeKey, note) => dispatch({ type: "ADD_RANGE_NOTE", rangeKey, note }),
    [],
  );
  const deleteRangeNote = useCallback(
    (rangeKey, noteId) =>
      dispatch({ type: "DELETE_RANGE_NOTE", rangeKey, noteId }),
    [],
  );
  const updateRangeNote = useCallback(
    (rangeKey, noteId, fields) =>
      dispatch({ type: "UPDATE_RANGE_NOTE", rangeKey, noteId, fields }),
    [],
  );

  const restoreDaySelection = useCallback(
    (dateKey) => dispatch({ type: "RESTORE_DAY_SELECTION", dateKey }),
    [],
  );
  const restoreRangeSelection = useCallback(
    (startKey, endKey) =>
      dispatch({ type: "RESTORE_RANGE_SELECTION", startKey, endKey }),
    [],
  );

  const activeRangeKey =
    state.rangeStart && state.rangeEnd
      ? `${formatDate(state.rangeStart)}__${formatDate(state.rangeEnd)}`
      : null;

  const value = {
    state,
    dispatch,
    prevMonth,
    nextMonth,
    gotoToday,
    gotoMonthYear,
    selectDate,
    clearRange,
    setHovered,
    setActiveNote,
    toggleNotesPanel,
    toggleTheme,
    addDayNote,
    deleteDayNote,
    updateDayNote,
    setMonthMemo,
    addRangeNote,
    deleteRangeNote,
    updateRangeNote,
    restoreDaySelection,
    restoreRangeSelection,
    today,
    activeRangeKey,
    MONTHS,
    WEEKDAYS,
    MONTH_GRADIENTS,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used inside CalendarProvider");
  return ctx;
}
