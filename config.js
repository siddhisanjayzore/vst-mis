// Set your backend URL when frontend is on GitHub Pages and backend is on Render
(function () {
  if (typeof window === 'undefined') return;

  var loc = window.location;
  var isLocal = loc && (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1');

  // Local development → use same origin
  if (isLocal) {
    window.MIS_API_URL  = loc.origin;
    return;
  }

  // Deployed frontend → use Render backend
  window.MIS_API_URL  = 'https://vst-mis-2.onrender.com';
})();
