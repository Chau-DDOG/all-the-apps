import { createDatastoreHistory } from '@all-the-apps/simulation/datastore';

const history = createDatastoreHistory({ datastoreId: 'f37f5d9c-9cb5-4d65-9d2c-6c3e6c5b5f33', teamIds: ['france', 'argentina'] });
export const saveSimulationRun = history.save;
export const listSimulationHistory = history.list;
