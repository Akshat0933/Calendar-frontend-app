import { useState, useRef, useEffect, useCallback } from "react";
import {
  useCalendar,
  formatDate,
  getRangeDiff,
  MONTHS,
} from "../context/CalendarContext";
import styles from "./NotesPanel.module.css";

const NOTE_COLORS = [
  { id: "gold", label: "Gold", hex: "#c9a86c" },
  { id: "rose", label: "Rose", hex: "#e87a7a" },
  { id: "sky", label: "Sky", hex: "#6c9ec9" },
  { id: "sage", label: "Sage", hex: "#7cb87c" },
  { id: "violet", label: "Violet", hex: "#a07cd8" },
  { id: "peach", label: "Peach", hex: "#e8a060" },
];

function formatShortDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function AutoTextarea({
  id,
  value,
  onChange,
  onKeyDown,
  placeholder,
  rows = 2,
  maxLength,
  className,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      className={className || styles.textarea}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      aria-label={placeholder}
    />
  );
}

function NoteInput({ id, placeholder, onSubmit, maxLength = 300 }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.noteInput}>
      <AutoTextarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <div className={styles.inputFooter}>
        <span className={styles.enterHint}>
          Enter to add | Shift+Enter for new line
        </span>
        <button
          className={styles.addBtn}
          onClick={handleSubmit}
          disabled={!text.trim()}
          aria-label="Add note"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function EditableNoteItem({ note, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(note.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <li className={`${styles.noteListItem} ${styles.noteListItemEditing}`}>
        <AutoTextarea
          id={`edit-${note.id}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Edit note..."
          maxLength={300}
          className={styles.editTextarea}
        />
        <div className={styles.editActions}>
          <button
            className={styles.saveEditBtn}
            onClick={handleSave}
            disabled={!draft.trim()}
          >
            Save
          </button>
          <button className={styles.cancelEditBtn} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.noteListItem}>
      <span className={styles.noteListText}>{note.text}</span>
      <div className={styles.noteItemActions}>
        <button
          className={styles.editBtn}
          onClick={() => setIsEditing(true)}
          aria-label="Edit note"
          title="Edit"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(note.id)}
          aria-label="Delete note"
          title="Delete"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </li>
  );
}

function NoteList({ notes, onUpdate, onDelete }) {
  if (!notes || notes.length === 0) return null;
  return (
    <ul className={styles.noteList} aria-label="Notes">
      {notes.map((note) => (
        <EditableNoteItem
          key={note.id}
          note={note}
          onSave={(text) => onUpdate(note.id, text)}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function MonthMemo({ currentMonth, currentYear }) {
  const { state, setMonthMemo } = useCalendar();
  const memoKey = `${currentYear}-${currentMonth}`;
  const savedValue = state.monthMemo[memoKey] || "";
  const [draft, setDraft] = useState(savedValue);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setMonthMemo(memoKey, draft.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const isDirty = draft.trim() !== savedValue;

  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>Month Memo</p>
      <AutoTextarea
        id="month-memo"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setIsSaved(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder={`General notes for ${MONTHS[currentMonth]}...`}
        maxLength={500}
      />
      <div className={styles.inputFooter}>
        {draft && (
          <span className={styles.charCount}>{draft.length} / 500</span>
        )}
        <button
          className={`${styles.addBtn} ${isSaved ? styles.addBtnSaved : ""}`}
          onClick={handleSave}
          disabled={!isDirty && !draft}
          id="btn-save-month-memo"
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function DayNotes({ dateKey, label }) {
  const { state, addDayNote, updateDayNote, deleteDayNote } = useCalendar();
  const notes = state.dayNotes[dateKey] || [];

  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>
        Notes - {label}
        {notes.length > 0 && (
          <span className={styles.countBadge}>{notes.length}</span>
        )}
      </p>
      <NoteList
        notes={notes}
        onUpdate={(noteId, text) => updateDayNote(dateKey, noteId, text)}
        onDelete={(noteId) => deleteDayNote(dateKey, noteId)}
      />
      <NoteInput
        id={`day-note-input-${dateKey}`}
        placeholder="Add a note..."
        onSubmit={(text) => addDayNote(dateKey, text)}
        maxLength={300}
      />
    </div>
  );
}

function EditableRangeNoteItem({ note, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title || "");
  const [body, setBody] = useState(note.body || "");
  const [color, setColor] = useState(note.color || NOTE_COLORS[0].hex);

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return;
    onSave({ title: title.trim(), body: body.trim(), color });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title || "");
    setBody(note.body || "");
    setColor(note.color || NOTE_COLORS[0].hex);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li
        className={`${styles.noteListItem} ${styles.noteListItemEditing}`}
        style={{ "--note-color": color }}
      >
        <div className={styles.rangeEditForm}>
          <input
            className={styles.titleInput}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            maxLength={80}
          />
          <AutoTextarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Details..."
            maxLength={600}
            className={styles.editTextarea}
          />
          <div
            className={styles.colorPicker}
            role="radiogroup"
            aria-label="Event color"
          >
            {NOTE_COLORS.map((nc) => (
              <button
                key={nc.id}
                role="radio"
                aria-checked={color === nc.hex}
                aria-label={nc.label}
                className={`${styles.colorSwatch} ${color === nc.hex ? styles.colorSwatchActive : ""}`}
                style={{ background: nc.hex }}
                onClick={() => setColor(nc.hex)}
              />
            ))}
          </div>
          <div className={styles.editActions}>
            <button className={styles.saveEditBtn} onClick={handleSave}>
              Save
            </button>
            <button className={styles.cancelEditBtn} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.noteListItem} style={{ borderLeftColor: note.color }}>
      <div className={styles.rangeNoteContent}>
        {note.title && <p className={styles.rangeNoteTitle}>{note.title}</p>}
        {note.body && <p className={styles.rangeNoteBody}>{note.body}</p>}
      </div>
      <div className={styles.noteItemActions}>
        <button
          className={styles.editBtn}
          onClick={() => setIsEditing(true)}
          aria-label="Edit event"
          title="Edit"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(note.id)}
          aria-label="Delete event"
          title="Delete"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </li>
  );
}

function RangeNoteEditor({ rangeKey, rangeStart, rangeEnd }) {
  const { state, addRangeNote, updateRangeNote, deleteRangeNote } =
    useCalendar();
  const notes = state.rangeNotes[rangeKey] || [];
  const dayCount = getRangeDiff(rangeStart, rangeEnd);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0].hex);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [body]);

  const handleSubmit = useCallback(() => {
    if (!title.trim() && !body.trim()) return;
    addRangeNote(rangeKey, {
      title: title.trim(),
      body: body.trim(),
      color,
      start: formatDate(rangeStart),
      end: formatDate(rangeEnd),
    });
    setTitle("");
    setBody("");
    setColor(NOTE_COLORS[0].hex);
  }, [title, body, color, rangeKey, rangeStart, rangeEnd, addRangeNote]);

  const handleBodyKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      bodyRef.current?.focus();
    }
  };

  return (
    <div className={styles.rangeEditor} style={{ "--note-color": color }}>
      <div className={styles.rangeEditorHeader}>
        <span className={styles.rangeEditorDate}>
          {formatShortDate(rangeStart)} - {formatShortDate(rangeEnd)}
          <span className={styles.dayCount}>
            {dayCount} day{dayCount !== 1 ? "s" : ""}
          </span>
        </span>
      </div>

      {notes.length > 0 && (
        <ul className={styles.noteList} aria-label="Range events">
          {notes.map((note) => (
            <EditableRangeNoteItem
              key={note.id}
              note={note}
              onSave={(fields) => updateRangeNote(rangeKey, note.id, fields)}
              onDelete={(noteId) => deleteRangeNote(rangeKey, noteId)}
            />
          ))}
        </ul>
      )}

      <input
        className={styles.titleInput}
        type="text"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        maxLength={80}
        aria-label="Event title"
        id={`range-title-${rangeKey}`}
      />

      <textarea
        ref={bodyRef}
        className={styles.textarea}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleBodyKeyDown}
        placeholder="Details or reminders..."
        rows={2}
        maxLength={600}
        aria-label="Event details"
        id={`range-body-${rangeKey}`}
      />

      <div
        className={styles.colorPicker}
        role="radiogroup"
        aria-label="Event color"
      >
        {NOTE_COLORS.map((nc) => (
          <button
            key={nc.id}
            role="radio"
            aria-checked={color === nc.hex}
            aria-label={nc.label}
            className={`${styles.colorSwatch} ${color === nc.hex ? styles.colorSwatchActive : ""}`}
            style={{ background: nc.hex }}
            onClick={() => setColor(nc.hex)}
          />
        ))}
      </div>

      <div className={styles.inputFooter}>
        <span className={styles.enterHint}>Enter to save event</span>
        <button
          className={styles.addBtn}
          onClick={handleSubmit}
          disabled={!title.trim() && !body.trim()}
          id={`btn-add-range-${rangeKey}`}
        >
          Add Event
        </button>
      </div>
    </div>
  );
}

export default function NotesPanel() {
  const {
    state,
    clearRange,
    toggleNotesPanel,
    activeRangeKey,
    restoreDaySelection,
    restoreRangeSelection,
  } = useCalendar();
  const {
    rangeStart,
    rangeEnd,
    activeNoteKey,
    notesPanelOpen,
    currentMonth,
    currentYear,
    dayNotes,
    rangeNotes,
  } = state;

  const hasRange = !!(rangeStart && rangeEnd);
  const hasSingle = !!(rangeStart && !rangeEnd);

  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const currentMonthDayKeys = Object.keys(dayNotes).filter((k) =>
    k.startsWith(currentMonthPrefix),
  );
  const totalDayNotesThisMonth = currentMonthDayKeys.reduce(
    (sum, k) => sum + (dayNotes[k]?.length || 0),
    0,
  );
  const totalRangeEvents = Object.values(rangeNotes).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return (
    <aside
      className={`${styles.panel} ${notesPanelOpen ? styles.panelOpen : styles.panelCollapsed}`}
      aria-label="Notes panel"
    >
      <button
        className={styles.toggleStrip}
        onClick={toggleNotesPanel}
        aria-label={
          notesPanelOpen ? "Collapse notes panel" : "Expand notes panel"
        }
        id="btn-toggle-notes"
      >
        <svg
          className={`${styles.toggleIcon} ${notesPanelOpen ? styles.toggleIconOpen : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {!notesPanelOpen && <span className={styles.toggleLabel}>Notes</span>}
      </button>

      {notesPanelOpen && (
        <div className={styles.panelBody}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              Notes &amp; Memos
              {totalDayNotesThisMonth + totalRangeEvents > 0 && (
                <span className={styles.headerBadge}>
                  {totalDayNotesThisMonth + totalRangeEvents}
                </span>
              )}
            </h2>
            {(hasRange || hasSingle) && (
              <button
                className={styles.clearSelectionBtn}
                onClick={clearRange}
                id="btn-clear-selection"
              >
                Clear
              </button>
            )}
          </div>

          {(hasRange || hasSingle) && (
            <div className={styles.selectionStatus} aria-live="polite">
              <span className={styles.selectionDot} />
              <span>
                {hasRange
                  ? `${formatShortDate(rangeStart)} to ${formatShortDate(rangeEnd)}`
                  : `${formatShortDate(rangeStart)} selected`}
              </span>
            </div>
          )}

          {state.isSelecting && (
            <div className={styles.hint} aria-live="polite">
              Click a second date to set the range end
            </div>
          )}

          <div className={styles.scrollArea}>
            <MonthMemo
              key={`${currentYear}-${currentMonth}`}
              currentMonth={currentMonth}
              currentYear={currentYear}
            />

            <div className={styles.divider} />

            {hasRange && activeRangeKey && (
              <>
                <p className={styles.sectionLabel}>Range Events</p>
                <RangeNoteEditor
                  rangeKey={activeRangeKey}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                />
                <div className={styles.divider} />
              </>
            )}

            {hasSingle && activeNoteKey && (
              <>
                <DayNotes
                  dateKey={activeNoteKey}
                  label={formatShortDate(new Date(`${activeNoteKey}T00:00:00`))}
                />
                <div className={styles.divider} />
              </>
            )}

            {currentMonthDayKeys.length > 0 && (
              <div className={styles.savedGroup}>
                <p className={styles.sectionLabel}>
                  All notes this month
                  <span className={styles.countBadge}>
                    {totalDayNotesThisMonth}
                  </span>
                </p>
                {currentMonthDayKeys.sort().map((dateKey) => {
                  const dateNotes = dayNotes[dateKey] || [];
                  if (dateNotes.length === 0) return null;
                  const isActive = activeNoteKey === dateKey && hasSingle;
                  return (
                    <div
                      key={dateKey}
                      className={`${styles.savedDateGroup} ${isActive ? styles.savedDateGroupActive : styles.savedDateGroupClickable}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit notes for ${formatShortDate(new Date(`${dateKey}T00:00:00`))}`}
                      onClick={() => restoreDaySelection(dateKey)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        restoreDaySelection(dateKey)
                      }
                    >
                      <p className={styles.savedDateLabel}>
                        {formatShortDate(new Date(`${dateKey}T00:00:00`))}
                        <span className={styles.countBadge}>
                          {dateNotes.length}
                        </span>
                        {!isActive && (
                          <span className={styles.editHint}>click to edit</span>
                        )}
                      </p>
                      {dateNotes.map((note) => (
                        <p key={note.id} className={styles.savedNoteText}>
                          {note.text.slice(0, 80)}
                          {note.text.length > 80 ? "..." : ""}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {Object.keys(rangeNotes).length > 0 && (
              <div className={styles.savedGroup}>
                <p className={styles.sectionLabel}>
                  All range events
                  <span className={styles.countBadge}>{totalRangeEvents}</span>
                </p>
                {Object.entries(rangeNotes).map(([key, eventList]) => {
                  if (eventList.length === 0) return null;
                  const [startKey, endKey] = key.split("__");
                  const isActive = activeRangeKey === key && hasRange;
                  return (
                    <div
                      key={key}
                      className={`${styles.savedDateGroup} ${isActive ? styles.savedDateGroupActive : styles.savedDateGroupClickable}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit range events for ${startKey} to ${endKey}`}
                      style={{ borderLeftColor: eventList[0]?.color }}
                      onClick={() => restoreRangeSelection(startKey, endKey)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        restoreRangeSelection(startKey, endKey)
                      }
                    >
                      <p className={styles.savedDateLabel}>
                        {startKey} - {endKey}
                        <span className={styles.countBadge}>
                          {eventList.length}
                        </span>
                        {!isActive && (
                          <span className={styles.editHint}>click to edit</span>
                        )}
                      </p>
                      {eventList.map((note) => (
                        <p key={note.id} className={styles.savedNoteText}>
                          {note.title || "(Untitled)"}
                          {note.body ? ` - ${note.body.slice(0, 40)}` : ""}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {!hasRange &&
              !hasSingle &&
              totalDayNotesThisMonth === 0 &&
              Object.keys(rangeNotes).length === 0 && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No notes yet</p>
                  <p className={styles.emptyBody}>
                    Click a date to add notes. Click two dates to create a range
                    event.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </aside>
  );
}
