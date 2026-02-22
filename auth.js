// Shared for login.html and register.html - API base URL and toast

// Use window.MIS_API_URL when you deploy frontend (e.g. GitHub Pages) and backend elsewhere (e.g. Render).
var AUTH_API_BASE = (function() {
  if (typeof window !== 'undefined' && window.MIS_API_URL) return window.MIS_API_URL;
  var loc = typeof window !== 'undefined' && window.location;
  if (!loc) return '';
  if (loc.protocol === 'file:' || loc.hostname === '' || loc.origin === 'null') {
    return 'http://localhost:3000';
  }
  return loc.origin;
})();

function authToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toastContainer');
  if (!container) return;
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(function() { el.remove(); }, 3000);
}
