import { useMemo, useCallback } from "react";
import {
  useCalendar,
  buildCalendarGrid,
  isSameDay,
  isInRange,
  formatDate,
  getHoliday,
  WEEKDAYS,
} from "../context/CalendarContext";
import styles from "./CalendarGrid.module.css";

export default function CalendarGrid() {
  const { state, selectDate, setHovered, setActiveNote, today } = useCalendar();
  const {
    currentMonth,
    currentYear,
    rangeStart,
    rangeEnd,
    hoveredDate,
    isSelecting,
    dayNotes,
  } = state;

  const cells = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const tentativeEnd = isSelecting && hoveredDate ? hoveredDate : null;
  const effectiveEnd = rangeEnd || tentativeEnd;

  const getCellState = useCallback(
    (date) => {
      const isStart = rangeStart ? isSameDay(date, rangeStart) : false;
      const isEnd = rangeEnd ? isSameDay(date, rangeEnd) : false;
      const isTentEnd = tentativeEnd ? isSameDay(date, tentativeEnd) : false;
      const inRange =
        effectiveEnd && rangeStart
          ? isInRange(date, rangeStart, effectiveEnd)
          : false;
      const isToday = isSameDay(date, today);
      const holiday = getHoliday(date);
      const dateKey = formatDate(date);
      const hasNote = (dayNotes[dateKey] || []).length > 0;
      return { isStart, isEnd, isTentEnd, inRange, isToday, holiday, hasNote };
    },
    [rangeStart, rangeEnd, tentativeEnd, effectiveEnd, today, dayNotes],
  );

  const handleCellClick = useCallback(
    (date) => {
      selectDate(date);
      setActiveNote(formatDate(date));
    },
    [selectDate, setActiveNote],
  );

  const handleMouseEnter = useCallback(
    (date) => setHovered(date),
    [setHovered],
  );
  const handleMouseLeave = useCallback(() => setHovered(null), [setHovered]);

  const handleKeyDown = useCallback(
    (e, date) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCellClick(date);
      }
    },
    [handleCellClick],
  );

  const animClass =
    state.animDir === "left"
      ? styles.enterLeft
      : state.animDir === "right"
        ? styles.enterRight
        : "";

  return (
    <div className={`${styles.gridWrapper} ${animClass}`}>
      <div className={styles.weekdayRow} role="row">
        {WEEKDAYS.map((label, idx) => (
          <div
            key={label}
            className={`${styles.weekdayCell} ${idx === 0 || idx === 6 ? styles.weekend : ""}`}
            role="columnheader"
          >
            {label}
          </div>
        ))}
      </div>

      <div
        className={styles.dayGrid}
        role="grid"
        aria-label={`Calendar for month ${currentMonth + 1} of ${currentYear}`}
        onMouseLeave={handleMouseLeave}
      >
        {cells.map(({ date, isCurrentMonth }, idx) => {
          const {
            isStart,
            isEnd,
            isTentEnd,
            inRange,
            isToday,
            holiday,
            hasNote,
          } = getCellState(date);
          const isEdge = isStart || isEnd || isTentEnd;
          const dateStr = formatDate(date);
          const isFirstCol = date.getDay() === 0;
          const isLastCol = date.getDay() === 6;

          const cellClasses = [
            styles.dayCell,
            !isCurrentMonth && styles.otherMonth,
            isToday && styles.today,
            isEdge && styles.edge,
            isStart && styles.rangeStart,
            (isEnd || isTentEnd) && styles.rangeEnd,
            inRange && styles.inRange,
            inRange && isFirstCol && styles.inRangeFirstCol,
            inRange && isLastCol && styles.inRangeLastCol,
            isTentEnd && !rangeEnd && styles.tentativeEnd,
            holiday && isCurrentMonth && styles.holiday,
            hasNote && isCurrentMonth && styles.hasNote,
          ]
            .filter(Boolean)
            .join(" ");

          const ariaLabel = [
            date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            holiday ? `Holiday: ${holiday}` : "",
            isStart ? "Range start" : "",
            isEnd ? "Range end" : "",
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={idx}
              role="gridcell"
              id={`day-${dateStr}`}
              tabIndex={isCurrentMonth ? 0 : -1}
              aria-label={ariaLabel}
              aria-pressed={isEdge}
              className={cellClasses}
              onClick={() => isCurrentMonth && handleCellClick(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              onKeyDown={(e) => isCurrentMonth && handleKeyDown(e, date)}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>

              {isToday && isCurrentMonth && (
                <span className={styles.todayMarker} aria-hidden="true" />
              )}

              {holiday && isCurrentMonth && (
                <span
                  className={styles.holidayMarker}
                  title={holiday}
                  aria-hidden="true"
                />
              )}

              {hasNote && isCurrentMonth && (
                <span className={styles.noteMarker} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
