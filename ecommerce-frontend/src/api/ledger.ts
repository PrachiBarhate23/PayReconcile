import api from './api';

export const getAllLedgerEntries = async () => {
  const res = await api.get('/ledger');
  return res.data;
};
