// Ghi đè fetch toàn cục
const originalFetch = window.fetch;

// Auto-detect API base URL (supports both local and production)
const API_BASE = window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "";

window.fetch = function (url, options = {}) {
  const token = localStorage.getItem("token");

  // Auto-prepend API_BASE if URL doesn't start with http
  const fullUrl = url.startsWith("http") ? url : API_BASE + url;

  options.headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: "Bearer " + token } : {})
  };

  return originalFetch(fullUrl, options);
};
