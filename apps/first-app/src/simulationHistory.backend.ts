import { createDatastoreHistory } from '@all-the-apps/simulation/datastore';

const history = createDatastoreHistory({
    datastoreId: 'c1240f47-fdbf-4c5a-921b-d51d3038053f',
    teamIds: ['argentina', 'spain'],
    legacyColumns: {
        leftGoals: 'argentina_goals',
        rightGoals: 'spain_goals',
        leftPenalties: 'argentina_penalties',
        rightPenalties: 'spain_penalties',
    },
});

export const saveSimulationRun = history.save;
export const listSimulationHistory = history.list;
