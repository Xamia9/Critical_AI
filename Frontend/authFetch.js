// Hỗ trợ gọi API 
const originalFetch = window.fetch;

const API_BASE = window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "";

window.fetch = function (url, options = {}) {
  const token = localStorage.getItem("token");

  const fullUrl = url.startsWith("http") ? url : API_BASE + url;

  options.headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: "Bearer " + token } : {})
  };

  return originalFetch(fullUrl, options);
};
