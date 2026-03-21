// Set your backend URL when frontend is on GitHub Pages and backend is on Render/Railway etc.
// Example: window.MIS_API_URL = 'https://your-app-name.onrender.com';
// Leave empty or remove this file when running locally or when frontend and backend are same origin.
(function () {
  if (typeof window === 'undefined') return;
  var loc = window.location;
  var isLocal = loc && (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1');

  // Local dev: call the same origin server (PORT=3001 etc.)
  if (isLocal) {
    window.MIS_API_URL = loc.origin;
    return;
  }

  // Hosted frontend: point to hosted backend
  window.MIS_API_URL = 'https://vst-mis.onrender.com';
})();
