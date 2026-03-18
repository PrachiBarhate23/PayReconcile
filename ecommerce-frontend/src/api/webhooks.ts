import api from './api';

export const getWebhookLogs = async () => {
  const res = await api.get('/webhook/stripe/logs');
  return res.data;
};
