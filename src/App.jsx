import { useEffect } from "react";
import {
  CalendarProvider,
  useCalendar,
  getMonthName,
} from "./context/CalendarContext";
import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";
import NotesPanel from "./components/NotesPanel";
import RangeStatusBar from "./components/RangeStatusBar";
import Legend from "./components/Legend";
import "./App.css";

function CalendarApp() {
  const { state } = useCalendar();
  const monthTheme = getMonthName(state.currentMonth);

  useEffect(() => {
    document.documentElement.setAttribute("data-month", monthTheme);
  }, [monthTheme]);

  return (
    <div className="appShell">
      <main
        className="calendarCard"
        role="main"
        aria-label="Interactive Wall Calendar"
      >
        <section className="calendarPanel" aria-label="Calendar">
          <CalendarHeader />
          <CalendarGrid />
          <RangeStatusBar />
          <Legend />
        </section>
        <NotesPanel />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CalendarProvider>
      <CalendarApp />
    </CalendarProvider>
  );
}
