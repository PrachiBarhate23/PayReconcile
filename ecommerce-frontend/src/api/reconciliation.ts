import api from './api';

export const getReconciliationMismatches = async () => {
  const res = await api.get('/reconciliation/mismatches');
  return res.data;
};

export const runReconciliation = async () => {
  return api.post('/reconciliation/run');
};
