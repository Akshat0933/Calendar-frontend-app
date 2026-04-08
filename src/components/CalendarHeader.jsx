import { useState, useRef, useEffect } from "react";
import {
  useCalendar,
  MONTHS,
  MONTH_GRADIENTS,
} from "../context/CalendarContext";
import heroImage from "../assets/hero.png";
import styles from "./CalendarHeader.module.css";

export default function CalendarHeader() {
  const { state, prevMonth, nextMonth, gotoToday, gotoMonthYear, toggleTheme } =
    useCalendar();
  const { currentMonth, currentYear, theme } = state;

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const pickerRef = useRef(null);
  const gradient = MONTH_GRADIENTS[currentMonth];

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    prevMonth();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    nextMonth();
    setTimeout(() => setIsAnimating(false), 300);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const yearRange = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) yearRange.push(y);

  return (
    <div className={styles.header}>
      <div
        className={`${styles.heroBanner} ${isAnimating ? styles.heroBannerAnimating : ""}`}
        style={{ background: gradient }}
        role="banner"
        aria-label={`${MONTHS[currentMonth]} ${currentYear}`}
      >
        <img
          src={heroImage}
          alt="Wall calendar visual"
          className={styles.heroImage}
        />

        <div className={styles.bindingHoles} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.bindingHole}>
              <div className={styles.bindingRing} />
            </div>
          ))}
        </div>

        <div className={styles.heroOverlay} />

        <div className={styles.heroText}>
          <p className={styles.heroLabel}>Wall Calendar</p>
          <h1 className={styles.heroMonth}>{MONTHS[currentMonth]}</h1>
          <span className={styles.heroYear}>{currentYear}</span>
        </div>

        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          id="btn-theme-toggle"
        >
          {theme === "dark" ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>

      <nav className={styles.navBar} aria-label="Month navigation">
        <button
          className={styles.navBtn}
          onClick={handlePrev}
          aria-label="Previous month"
          id="btn-prev-month"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.navCenter} ref={pickerRef}>
          <button
            className={styles.navPickerBtn}
            onClick={() => {
              setShowMonthPicker((v) => !v);
              setShowYearPicker(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={showMonthPicker}
            id="btn-month-picker"
          >
            {MONTHS[currentMonth]}
            <svg
              className={styles.chevron}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <button
            className={styles.navPickerBtn}
            onClick={() => {
              setShowYearPicker((v) => !v);
              setShowMonthPicker(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={showYearPicker}
            id="btn-year-picker"
          >
            {currentYear}
            <svg
              className={styles.chevron}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showMonthPicker && (
            <div
              className={styles.dropdown}
              role="listbox"
              aria-label="Select month"
            >
              <div className={styles.monthGrid}>
                {MONTHS.map((name, idx) => (
                  <button
                    key={name}
                    role="option"
                    aria-selected={idx === currentMonth}
                    className={`${styles.dropdownItem} ${
                      idx === currentMonth ? styles.dropdownItemActive : ""
                    }`}
                    onClick={() => {
                      gotoMonthYear(idx, currentYear);
                      setShowMonthPicker(false);
                    }}
                  >
                    {name.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showYearPicker && (
            <div
              className={styles.dropdown}
              role="listbox"
              aria-label="Select year"
            >
              <div className={styles.yearList}>
                {yearRange.map((y) => (
                  <button
                    key={y}
                    role="option"
                    aria-selected={y === currentYear}
                    className={`${styles.dropdownItem} ${
                      y === currentYear ? styles.dropdownItemActive : ""
                    }`}
                    onClick={() => {
                      gotoMonthYear(currentMonth, y);
                      setShowYearPicker(false);
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className={`${styles.navBtn} ${styles.todayBtn}`}
          onClick={gotoToday}
          id="btn-goto-today"
        >
          Today
        </button>

        <button
          className={styles.navBtn}
          onClick={handleNext}
          aria-label="Next month"
          id="btn-next-month"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
