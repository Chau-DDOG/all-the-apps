import { createDatastoreHistory } from '@all-the-apps/simulation/datastore';

const history = createDatastoreHistory({
    datastoreId: '9b4c23fc-6d65-4080-a9df-9067a7861321',
    teamIds: ['france', 'england'],
});

export const saveSimulationRun = history.save;
export const listSimulationHistory = history.list;
