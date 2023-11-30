import axios from 'axios';
import axiosRetry from 'axios-retry';

export const checkReportStatus = () => {
  axiosRetry(axios, { retries: 3 });
};
