import { useCalendar, getRangeDiff } from "../context/CalendarContext";
import styles from "./RangeStatusBar.module.css";

function formatDisplayDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RangeStatusBar() {
  const { state, clearRange } = useCalendar();
  const { rangeStart, rangeEnd, isSelecting } = state;

  const hasRange = !!(rangeStart && rangeEnd);
  const hasSingle = !!(rangeStart && !rangeEnd && !isSelecting);
  const isVisible = !!(rangeStart || isSelecting);

  if (!isVisible) return null;

  const dayCount = hasRange ? getRangeDiff(rangeStart, rangeEnd) : null;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.content}>
        {isSelecting && (
          <div className={styles.selectingRow}>
            <span className={styles.pulseDot} />
            <span>Click end date to complete range</span>
          </div>
        )}

        {hasRange && (
          <div className={styles.rangeRow}>
            <div className={styles.datePill} data-type="start">
              <span className={styles.pillLabel}>From</span>
              <span className={styles.pillDate}>
                {formatDisplayDate(rangeStart)}
              </span>
            </div>

            <svg
              className={styles.arrowIcon}
              width="18"
              height="10"
              viewBox="0 0 24 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 6h20M15 1l6 5-6 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className={styles.datePill} data-type="end">
              <span className={styles.pillLabel}>To</span>
              <span className={styles.pillDate}>
                {formatDisplayDate(rangeEnd)}
              </span>
            </div>

            <span className={styles.dayCountBadge}>
              {dayCount} day{dayCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {hasSingle && (
          <div className={styles.singleRow}>
            <span className={styles.singleLabel}>Selected:</span>
            <span className={styles.singleDate}>
              {formatDisplayDate(rangeStart)}
            </span>
          </div>
        )}
      </div>

      {rangeStart && (
        <button
          className={styles.clearBtn}
          onClick={clearRange}
          aria-label="Clear selection"
          id="btn-status-clear"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
