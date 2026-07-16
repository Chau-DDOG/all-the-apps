import { ForecastApp } from '@all-the-apps/simulation';
import { forecast } from './matchData';
import { listSimulationHistory, saveSimulationRun } from './simulationHistory.backend';
import './styles.css';

export default function App() {
  return <ForecastApp forecast={forecast} persistence={{ save: saveSimulationRun, list: listSimulationHistory }} />;
}
