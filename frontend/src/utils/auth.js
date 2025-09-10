// frontend/src/utils/auth.js
import axios from "axios";

let accessToken = null; // primary in-memory storage

export const setAccessToken = (token) => {
  accessToken = token;
  // temporary persistence across reloads; consider removing this when you switch to pure in-memory
  localStorage.setItem("access_token", token);
};

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem("access_token"); // restore if page reload
  }
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("access_token");
};

// Axios instance for your API calls
export const api = axios.create({
  baseURL: "/api", // Vite proxy should forward /api -> backend
  withCredentials: true, // ensure cookies (refresh token) are sent
});

// REQUEST INTERCEPTOR
// Attach Authorization header automatically if access token exists
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// RESPONSE INTERCEPTOR
// On 401, try to refresh the access token using the refresh cookie, then retry original request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or not a 401 or we've already retried, reject
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Call refresh endpoint using axios (not api) to avoid triggering interceptors
      const refreshRes = await axios.post(
        "/api/auth/refresh",
        {},
        { withCredentials: true } // browser will send the httpOnly refresh cookie
      );

      const newToken = refreshRes.data.accessToken;
      if (!newToken) {
        // if server didn't send a token, force logout
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // store new access token
      setAccessToken(newToken);

      // update the original request with the new token and retry
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      // refresh failed -> clear token and redirect to login
      clearAccessToken();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);
