import { useState } from "react";

type ThemeMode = "light" | "dark";

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  return (
    <main className="app-shell" data-theme={theme}>
      <section className="hero-card" aria-labelledby="hello-title">
        <div
          className="theme-switcher"
          role="group"
          aria-label="Choose color mode"
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className="theme-switcher__option"
              type="button"
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="eyebrow">Datadog App Builder</p>
        <div className="sparkle" aria-hidden="true">
          ✨
        </div>
        <h1 id="hello-title">Hello, World!</h1>
        <p className="intro">
          Welcome to Chau&apos;s new Datadog App, complete with a bright light
          mode and a calm dark mode.
        </p>

        <div className="status-pill" aria-live="polite">
          {theme === "light" ? "Light" : "Dark"} mode active
        </div>
      </section>
    </main>
  );
}

export default App;
