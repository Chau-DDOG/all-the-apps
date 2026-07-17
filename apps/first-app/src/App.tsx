import { ForecastApp } from '@all-the-apps/simulation';
import { useState } from 'react';

import { forecast } from './matchData';
import { listSimulationHistory, saveSimulationRun } from './simulationHistory.backend';
import './styles.css';

type ThemeMode = 'light' | 'dark';

const themeModes: { label: string; value: ThemeMode }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
];

// Smoke test: verify the deploy-datadog-apps workflow uploads on merge.
function App() {
    const [theme, setTheme] = useState<ThemeMode>('light');

    return (
        <div className="first-app-theme" data-theme={theme}>
            <div className="theme-toggle" role="group" aria-label="Color mode">
                {themeModes.map((mode) => (
                    <button
                        className="theme-toggle__option"
                        type="button"
                        aria-pressed={theme === mode.value}
                        key={mode.value}
                        onClick={() => setTheme(mode.value)}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
            <ForecastApp
                forecast={forecast}
                persistence={{ save: saveSimulationRun, list: listSimulationHistory }}
            />
        </div>
    );
}

export default App;
