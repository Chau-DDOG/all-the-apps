import { createDatastoreHistory } from '@all-the-apps/simulation/datastore';

const history = createDatastoreHistory({ datastoreId: 'c546afd3-7579-473d-89a6-91178a87fd74', teamIds: ['france', 'argentina'] });
export const saveSimulationRun = history.save;
export const listSimulationHistory = history.list;
