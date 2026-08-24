import axios from 'axios';

const api = axios.create({
  baseURL: 'https://prodsync-xpef.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// We can add interceptors here later if we implement JWT authentication
export default api;
