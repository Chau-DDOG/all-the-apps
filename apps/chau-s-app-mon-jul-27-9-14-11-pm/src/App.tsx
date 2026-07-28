import { useState } from "react";

type Theme = "light" | "dark";

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
    </svg>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>("light");

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className={`root ${theme}`}>
      <div className="card">
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
          <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </button>

        <div className="greeting">
          <div className="wave" aria-hidden="true">👋</div>
          <h1>Hello, World!</h1>
          <p>Welcome to your new Datadog App.</p>
        </div>

        <div className="badge">
          <span className="dot" />
          {theme === "light" ? "Light" : "Dark"} mode active
        </div>
      </div>
    </div>
  );
}

export default App;
