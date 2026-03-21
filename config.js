// Set your backend URL when frontend is on GitHub Pages and backend is on Render
(function () {
  if (typeof window === 'undefined') return;

  var loc = window.location;
  var isLocal = loc && (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1');

  // Local development → use same origin
  if (isLocal) {
    window.AUTH_API_BASE = loc.origin;
    return;
  }

  // Deployed frontend → use Render backend
  window.AUTH_API_BASE = 'https://vst-mis-2.onrender.com';
})();
