// VST Tillers Tractors - MIS Application

// Use window.MIS_API_URL when frontend is on GitHub Pages and backend is on Render/Railway etc.
const API_BASE = (function() {
  if (typeof window !== 'undefined' && window.MIS_API_URL) return window.MIS_API_URL;
  const loc = typeof window !== 'undefined' && window.location;
  if (!loc) return '';
  if (loc.protocol === 'file:' || loc.hostname === '' || loc.origin === 'null') {
    return 'http://localhost:3000';
  }
  return '';
})();

let salesSort = { key: null, dir: 1 };
let dealersSort = { key: null, dir: 1 };
let inventorySort = { key: null, dir: 1 };

let authToken = null;
let currentUser = null;

function getAuthHeaders() {
  return authToken ? { 'Authorization': 'Bearer ' + authToken } : {};
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initDate();
  initNavigation();
  initModals();
  checkAuth();
});

async function loadDataAndRender() {
  try {
    const res = await fetch(API_BASE + '/api/data');
    if (res.ok) {
      const data = await res.json();
      MIS_DATA.orders = data.orders || MIS_DATA.orders;
      MIS_DATA.dealers = data.dealers || MIS_DATA.dealers;
      MIS_DATA.inventory = data.inventory || MIS_DATA.inventory;
      MIS_DATA.products = data.products || MIS_DATA.products;
      MIS_DATA.production = data.production || MIS_DATA.production;
      MIS_DATA.productionUtilization = data.productionUtilization || MIS_DATA.productionUtilization;
      MIS_DATA.kpi = data.kpi || MIS_DATA.kpi;
      MIS_DATA.monthlySales = data.monthlySales || MIS_DATA.monthlySales;
      MIS_DATA.productMix = data.productMix || MIS_DATA.productMix;
    }
  } catch (e) {
    console.warn('Using offline/static data:', e.message);
  }
  renderDashboard();
  renderSales();
  renderInventory();
  renderProduction();
  renderDealers();
}

function toast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function initDate() {
  const el = document.getElementById('dateDisplay');
  if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('is-open');
    if (modal.classList.contains('auth-modal')) {
      document.body.classList.add('auth-modal-open');
    }
  }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('is-open');
    if (modal.classList.contains('auth-modal')) {
      // Only remove class if no auth modal is open
      const hasOpenAuth = document.querySelector('.auth-modal.is-open');
      if (!hasOpenAuth) {
        document.body.classList.remove('auth-modal-open');
      }
    }
  }
}
function initModals() {
  document.querySelectorAll('[data-dismiss]').forEach(el => {
    el.addEventListener('click', () => {
      const modalId = el.dataset.dismiss;
      const modal = document.getElementById(modalId);
      // Don't allow closing auth modals by clicking backdrop
      if (!modal?.classList.contains('auth-modal')) {
        closeModal(modalId);
      }
    });
  });
  
  // Prevent auth modal backdrop from closing modal
  document.querySelectorAll('.auth-modal .modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      // Don't close auth modals on backdrop click
    });
  });
}

function initAuth() {
  authToken = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch (e) {
      currentUser = null;
    }
  }
}

function checkAuth() {
  if (!authToken) {
    window.location.href = 'login.html';
    return false;
  }

  // Verify token
  fetch(API_BASE + '/api/auth/verify', {
    headers: { 'Authorization': 'Bearer ' + authToken }
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      throw new Error('Invalid token');
    })
    .then(data => {
      currentUser = data.user;
      updateUserDisplay();
      loadDataAndRender();
      initReports();
      initFilters();
      initButtons();
      initTableSorting();
    })
    .catch(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      authToken = null;
      currentUser = null;
      window.location.href = 'login.html';
    });

  return true;
}

function updateUserDisplay() {
  const trigger = document.getElementById('userMenuTrigger');
  const dropdown = document.getElementById('userDropdown');
  const avatarEl = document.querySelector('.user-avatar');
  const nameEl = document.querySelector('.user-name');
  const logoutBtn = document.getElementById('userDropdownLogout');
  const profileBtn = document.getElementById('userDropdownProfile');

  if (currentUser) {
    const nameParts = currentUser.name.split(' ');
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : currentUser.name.substring(0, 2).toUpperCase();
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = currentUser.name;
    if (trigger) trigger.style.display = 'flex';
    if (dropdown) dropdown.setAttribute('hidden', '');

    const chevronBtnRef = document.getElementById('userMenuChevron');
    function closeDropdown() {
      if (dropdown) dropdown.setAttribute('hidden', '');
      if (chevronBtnRef) chevronBtnRef.setAttribute('aria-expanded', 'false');
      document.querySelector('.user-menu-wrap')?.classList.remove('open');
      document.removeEventListener('click', outsideClick);
    }
    function outsideClick(e) {
      if (!document.querySelector('.user-menu-wrap')?.contains(e.target)) closeDropdown();
    }
    const chevronBtn = document.getElementById('userMenuChevron');
    if (chevronBtn && !chevronBtn._bound) {
      chevronBtn._bound = true;
      chevronBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown?.hasAttribute('hidden');
        if (isOpen) {
          dropdown?.removeAttribute('hidden');
          chevronBtn?.setAttribute('aria-expanded', 'true');
          document.querySelector('.user-menu-wrap')?.classList.add('open');
          document.addEventListener('click', outsideClick);
        } else {
          closeDropdown();
        }
      });
    }
    if (logoutBtn && !logoutBtn._bound) {
      logoutBtn._bound = true;
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        authToken = null;
        currentUser = null;
        window.location.href = 'login.html';
      });
    }
    if (profileBtn && !profileBtn._bound) {
      profileBtn._bound = true;
      profileBtn.addEventListener('click', () => {
        document.getElementById('profileModalName').textContent = currentUser.name || '—';
        document.getElementById('profileModalEmail').textContent = currentUser.email || '—';
        document.getElementById('profileModalOverlay').classList.add('show');
        document.getElementById('profileModalOverlay').setAttribute('aria-hidden', 'false');
        document.querySelector('.user-menu-wrap')?.classList.remove('open');
        document.getElementById('userDropdown')?.setAttribute('hidden', '');
        document.getElementById('userMenuChevron')?.setAttribute('aria-expanded', 'false');
      });
    }
  } else {
    if (trigger) trigger.style.display = 'none';
    if (dropdown) dropdown.setAttribute('hidden', '');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const profileClose = document.getElementById('profileModalClose');
  const profileOverlay = document.getElementById('profileModalOverlay');
  if (profileClose) {
    profileClose.addEventListener('click', () => {
      profileOverlay?.classList.remove('show');
      profileOverlay?.setAttribute('aria-hidden', 'true');
    });
  }
  if (profileOverlay) {
    profileOverlay.addEventListener('click', (e) => {
      if (e.target === profileOverlay) {
        profileOverlay.classList.remove('show');
        profileOverlay.setAttribute('aria-hidden', 'true');
      }
    });
  }
});

async function loadDataAndRender() {
  if (!authToken) return;
  
  try {
    const res = await fetch(API_BASE + '/api/data', {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      MIS_DATA.orders = data.orders || MIS_DATA.orders;
      MIS_DATA.dealers = data.dealers || MIS_DATA.dealers;
      MIS_DATA.inventory = data.inventory || MIS_DATA.inventory;
      MIS_DATA.products = data.products || MIS_DATA.products;
      MIS_DATA.production = data.production || MIS_DATA.production;
      MIS_DATA.productionUtilization = data.productionUtilization || MIS_DATA.productionUtilization;
      MIS_DATA.kpi = data.kpi || MIS_DATA.kpi;
      MIS_DATA.monthlySales = data.monthlySales || MIS_DATA.monthlySales;
      MIS_DATA.productMix = data.productMix || MIS_DATA.productMix;
    } else if (res.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      authToken = null;
      window.location.href = 'login.html';
      return;
    }
  } catch (e) {
    console.warn('Using offline/static data:', e.message);
  }
  renderDashboard();
  renderSales();
  renderInventory();
  renderProduction();
  renderDealers();
}

function initNavigation() {
  const title = document.getElementById('pageTitle');
  const pages = document.querySelectorAll('.page');
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      pages.forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
      });
      const titles = { dashboard: 'Dashboard', sales: 'Sales & Orders', inventory: 'Inventory', production: 'Production', dealers: 'Dealers', reports: 'Reports' };
      if (title) title.textContent = titles[page] || 'Dashboard';
      if (page === 'dashboard') setTimeout(drawCharts, 50);
    });
  });
}

function getLowStockItems() {
  return MIS_DATA.inventory.filter(i => i.stock <= i.reorderLevel);
}

function renderDashboard() {
  const k = MIS_DATA.kpi;
  document.getElementById('kpiRevenue').textContent = k.revenue.toLocaleString('en-IN');
  document.getElementById('kpiUnits').textContent = k.unitsYTD.toLocaleString('en-IN');
  document.getElementById('kpiDealers').textContent = MIS_DATA.dealers.length.toLocaleString('en-IN');
  document.getElementById('kpiCapacity').textContent = k.capacityPercent + '%';

  const alertsEl = document.getElementById('dashboardAlerts');
  const lowStock = getLowStockItems();
  if (lowStock.length) {
    alertsEl.innerHTML = lowStock.map(i => `
      <div class="alert-card">
        <span class="alert-icon">⚠️</span>
        <span class="alert-text">Low stock: <strong>${i.name}</strong> (${i.stock} units, reorder at ${i.reorderLevel})</span>
        <span class="alert-link" data-goto="inventory">View Inventory</span>
      </div>
    `).join('');
    alertsEl.querySelectorAll('.alert-link').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelector('[data-page="inventory"]')?.click();
      });
    });
  } else {
    alertsEl.innerHTML = '';
  }

  const recent = [...MIS_DATA.orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const tbody = document.getElementById('recentOrdersBody');
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.dealer}</td>
      <td>${o.product}</td>
      <td>${o.qty}</td>
      <td>${formatMoney(o.amount)}</td>
      <td><span class="status-badge ${o.status.toLowerCase()}">${o.status}</span></td>
    </tr>
  `).join('');

  setTimeout(drawCharts, 100);
}

function drawCharts() {
  drawBarChart();
  drawProductMixChart();
}

const CHART_WIDTH = 400;
const CHART_HEIGHT = 200;

function drawBarChart() {
  const canvas = document.getElementById('chartSales');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CHART_WIDTH * dpr;
  canvas.height = CHART_HEIGHT * dpr;
  ctx.scale(dpr, dpr);
  const w = CHART_WIDTH, h = CHART_HEIGHT;
  ctx.clearRect(0, 0, w, h);

  const data = MIS_DATA.monthlySales;
  const max = Math.max(...data.map(d => d.units));
  const pad = { left: 40, right: 20, top: 20, bottom: 30 };
  const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom;
  const barW = chartW / data.length * 0.6;
  const gap = chartW / data.length * 0.4;

  data.forEach((d, i) => {
    const x = pad.left + i * (chartW / data.length) + gap / 2;
    const barH = (d.units / max) * chartH;
    const y = pad.top + chartH - barH;
    ctx.fillStyle = '#2d7a2d';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = '#1a2e1a';
    ctx.font = '11px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText(d.month, x + barW / 2, h - 8);
    ctx.fillText(d.units, x + barW / 2, y - 4);
  });
}

function drawProductMixChart() {
  const canvas = document.getElementById('chartProductMix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CHART_WIDTH * dpr;
  canvas.height = CHART_HEIGHT * dpr;
  ctx.scale(dpr, dpr);
  const w = CHART_WIDTH, h = CHART_HEIGHT;
  ctx.clearRect(0, 0, w, h);

  const data = MIS_DATA.productMix;
  let start = -Math.PI / 2;
  const cx = w / 2, cy = h / 2 - 10, r = Math.min(w, h) / 2 - 30;

  data.forEach((d, i) => {
    const slice = (d.value / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    start += slice;
  });

  ctx.fillStyle = '#1a2e1a';
  ctx.font = '12px DM Sans';
  ctx.textAlign = 'left';
  data.forEach((d, i) => {
    ctx.fillStyle = d.color;
    ctx.fillRect(w - 100, 20 + i * 22, 12, 12);
    ctx.fillStyle = '#1a2e1a';
    ctx.fillText(`${d.name} ${d.value}%`, w - 84, 30 + i * 22);
  });
}

function formatMoney(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr';
  if (n >= 100000) return (n / 100000).toFixed(1) + ' L';
  return n.toLocaleString('en-IN');
}

function getFilteredOrders() {
  const q = (document.getElementById('salesSearch')?.value || '').toLowerCase();
  const status = document.getElementById('salesStatusFilter')?.value || '';
  return MIS_DATA.orders.filter(o =>
    (!q || o.dealer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)) &&
    (!status || o.status === status)
  );
}

function getSortedOrders() {
  let list = getFilteredOrders();
  if (salesSort.key) {
    list = [...list].sort((a, b) => {
      let va = a[salesSort.key], vb = b[salesSort.key];
      if (salesSort.key === 'amount') { va = a.amount; vb = b.amount; }
      if (salesSort.key === 'date') return salesSort.dir * (va.localeCompare(vb));
      if (typeof va === 'number' && typeof vb === 'number') return salesSort.dir * (va - vb);
      return salesSort.dir * (String(va).localeCompare(String(vb)));
    });
  }
  return list;
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(API_BASE + '/api/orders/' + encodeURIComponent(orderId) + '/status', {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const o = MIS_DATA.orders.find(x => x.id === orderId);
      if (o) o.status = newStatus;
      renderSales();
      toast('Order status updated to ' + newStatus);
    } else {
      const err = await res.json().catch(() => ({}));
      toast(err.error || 'Update failed', 'error');
    }
  } catch (e) {
    const o = MIS_DATA.orders.find(x => x.id === orderId);
    if (o) { o.status = newStatus; renderSales(); toast('Order status updated to ' + newStatus); }
    else toast('Update failed', 'error');
  }
}

function renderSales() {
  const list = getSortedOrders();
  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = list.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.date}</td>
      <td>${o.dealer}</td>
      <td>${o.product}</td>
      <td>${o.qty}</td>
      <td>${formatMoney(o.amount)}</td>
      <td><span class="status-badge ${o.status.toLowerCase()}">${o.status}</span></td>
      <td>
        <select class="status-select btn-sm" data-order-id="${o.id}" title="Change status">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Dispatched" ${o.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
    </tr>
  `).join('');
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => updateOrderStatus(sel.dataset.orderId, sel.value));
  });
}
window.filterSales = () => renderSales();

function updateInventoryStatus(item) {
  item.status = item.stock <= item.reorderLevel ? 'low-stock' : 'in-stock';
}

function getSortedInventory() {
  const list = [...MIS_DATA.inventory];
  if (!inventorySort.key) return list;
  return list.sort((a, b) => {
    let va = a[inventorySort.key], vb = b[inventorySort.key];
    if (typeof va === 'number' && typeof vb === 'number') return inventorySort.dir * (va - vb);
    return inventorySort.dir * (String(va).localeCompare(String(vb)));
  });
}

function renderInventory() {
  const tillers = MIS_DATA.inventory.filter(i => i.category === 'Power Tiller').reduce((s, i) => s + i.stock, 0);
  const tractors = MIS_DATA.inventory.filter(i => i.category === 'Tractor').reduce((s, i) => s + i.stock, 0);
  const implements_ = MIS_DATA.inventory.filter(i => i.category === 'Implement').reduce((s, i) => s + i.stock, 0);

  document.getElementById('invTillers').textContent = tillers;
  document.getElementById('invTractors').textContent = tractors;
  document.getElementById('invImplements').textContent = implements_;

  const list = getSortedInventory();
  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = list.map(i => `
    <tr>
      <td>${i.sku}</td>
      <td>${i.name}</td>
      <td>${i.category}</td>
      <td>${i.stock}</td>
      <td>${i.reorderLevel}</td>
      <td><span class="status-badge ${i.status}">${i.status === 'in-stock' ? 'In Stock' : 'Low Stock'}</span></td>
      <td><button type="button" class="btn btn-sm btn-secondary adjust-stock-btn" data-sku="${i.sku}">Adjust</button></td>
    </tr>
  `).join('');
  tbody.querySelectorAll('.adjust-stock-btn').forEach(btn => {
    btn.addEventListener('click', () => openAdjustStockModal(btn.dataset.sku));
  });
}

function renderProduction() {
  const util = MIS_DATA.productionUtilization;
  document.getElementById('prodTillersBar').style.width = util.tillers + '%';
  document.getElementById('prodTractorsBar').style.width = util.tractors + '%';
  document.getElementById('prodTillersPct').textContent = util.tillers;
  document.getElementById('prodTractorsPct').textContent = util.tractors;

  const tbody = document.getElementById('productionTableBody');
  tbody.innerHTML = MIS_DATA.production.map(p => `
    <tr>
      <td>${p.model}</td>
      <td>${p.planned}</td>
      <td>${p.produced}</td>
      <td>${p.targetDate}</td>
      <td><span class="status-badge ${p.status}">${p.status === 'on-track' ? 'On Track' : 'Delayed'}</span></td>
    </tr>
  `).join('');
}

function getFilteredDealers() {
  const q = (document.getElementById('dealersSearch')?.value || '').toLowerCase();
  const region = document.getElementById('dealersRegionFilter')?.value || '';
  return MIS_DATA.dealers.filter(d =>
    (!q || d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q)) &&
    (!region || d.region === region)
  );
}

function getSortedDealers() {
  let list = getFilteredDealers();
  if (dealersSort.key) {
    list = [...list].sort((a, b) => {
      const va = a[dealersSort.key], vb = b[dealersSort.key];
      if (dealersSort.key === 'ytdSales') return dealersSort.dir * (va - vb);
      return dealersSort.dir * (String(va).localeCompare(String(vb)));
    });
  }
  return list;
}

function renderDealers() {
  const list = getSortedDealers();
  const tbody = document.getElementById('dealersTableBody');
  tbody.innerHTML = list.map(d => `
    <tr>
      <td>${d.code}</td>
      <td>${d.name}</td>
      <td>${d.region}</td>
      <td>${d.city}</td>
      <td>${d.contact}</td>
      <td>${formatMoney(d.ytdSales)}</td>
    </tr>
  `).join('');
}
window.filterDealers = () => renderDealers();

function initFilters() {
  document.getElementById('salesSearch')?.addEventListener('input', window.filterSales);
  document.getElementById('salesStatusFilter')?.addEventListener('change', window.filterSales);
  document.getElementById('dealersSearch')?.addEventListener('input', window.filterDealers);
  document.getElementById('dealersRegionFilter')?.addEventListener('change', window.filterDealers);
}

function initReports() {
  const preview = document.getElementById('reportPreview');
  const texts = {
    'sales-summary': '<h4>Sales Summary Report</h4><p>Region-wise: North 28%, South 35%, East 20%, West 17%. Top product: 165 DI ES (22% of units).</p>',
    'inventory': '<h4>Inventory Report</h4><p>Total SKUs: 8. 2 items below reorder level (130 DI, Trailer). Recommended reorder: 130 DI +80 units, Trailer +15 units.</p>',
    'production': '<h4>Production Report</h4><p>Power Tillers line at 82% utilization. Tractors at 72%. 130 DI batch delayed by ~3 days; rest on track.</p>',
    'dealer-performance': '<h4>Dealer Performance</h4><p>Top 3: VST Motors Coimbatore (₹3.12 Cr), North Farm Equip (₹2.89 Cr), Harvest Dealers (₹2.67 Cr).</p>'
  };
  document.querySelectorAll('.report-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.report-card').forEach(c => c.style.borderColor = '');
      card.style.borderColor = 'var(--accent)';
      const r = card.dataset.report;
      if (preview) preview.innerHTML = texts[r] || '<p>No preview.</p>';
    });
  });
}

function getCurrentSection() {
  const activeNav = document.querySelector('.nav-item.active');
  return activeNav ? activeNav.dataset.page : 'dashboard';
}

async function refreshCurrentSection() {
  if (!authToken) return;
  const section = getCurrentSection();
  try {
    const res = await fetch(API_BASE + '/api/data', {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      MIS_DATA.orders = data.orders || MIS_DATA.orders;
      MIS_DATA.dealers = data.dealers || MIS_DATA.dealers;
      MIS_DATA.inventory = data.inventory || MIS_DATA.inventory;
      MIS_DATA.products = data.products || MIS_DATA.products;
      MIS_DATA.production = data.production || MIS_DATA.production;
      MIS_DATA.productionUtilization = data.productionUtilization || MIS_DATA.productionUtilization;
      MIS_DATA.kpi = data.kpi || MIS_DATA.kpi;
      MIS_DATA.monthlySales = data.monthlySales || MIS_DATA.monthlySales;
      MIS_DATA.productMix = data.productMix || MIS_DATA.productMix;
    } else if (res.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      authToken = null;
      window.location.href = 'login.html';
      return;
    }
  } catch (e) {
    toast('Could not fetch latest data', 'error');
    return;
  }
  switch (section) {
    case 'dashboard':
      renderDashboard();
      toast('Dashboard refreshed');
      break;
    case 'sales':
      renderSales();
      toast('Sales & Orders refreshed');
      break;
    case 'inventory':
      renderInventory();
      toast('Inventory refreshed');
      break;
    case 'production':
      renderProduction();
      toast('Production refreshed');
      break;
    case 'dealers':
      renderDealers();
      toast('Dealers refreshed');
      break;
    case 'reports':
      toast('Reports refreshed');
      break;
    default:
      renderDashboard();
      toast('Refreshed');
  }
}

function initButtons() {
  document.getElementById('btnRefreshDashboard')?.addEventListener('click', async () => {
    await refreshCurrentSection();
  });
  document.getElementById('btnAddOrder')?.addEventListener('click', async () => {
    document.getElementById('formOrder').reset();
    const dealerSelect = document.getElementById('orderDealer');
    const productSelect = document.getElementById('orderProduct');
    dealerSelect.innerHTML = MIS_DATA.dealers.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    productSelect.innerHTML = MIS_DATA.products.map(p => `<option value="${p.name}" data-price="${p.unitPrice}">${p.name} (₹${p.unitPrice.toLocaleString()})</option>`).join('');
    document.getElementById('orderAmountPreview').textContent = '₹ 0';
    try {
      const r = await fetch(API_BASE + '/api/next-order-id', {
        headers: getAuthHeaders()
      });
      if (r.ok) {
        const { nextId } = await r.json();
        document.getElementById('formOrder').dataset.nextOrderId = nextId;
      }
    } catch (_) {}
    openModal('modalOrder');
  });
  document.getElementById('btnAddDealer')?.addEventListener('click', () => {
    document.getElementById('formDealer').reset();
    openModal('modalDealer');
  });
  document.getElementById('orderProduct')?.addEventListener('change', () => {
    const sel = document.getElementById('orderProduct');
    const opt = sel.options[sel.selectedIndex];
    const price = opt ? parseInt(opt.dataset.price, 10) : 0;
    const qty = parseInt(document.getElementById('orderQty').value, 10) || 0;
    document.getElementById('orderAmountPreview').textContent = '₹ ' + (price * qty).toLocaleString('en-IN');
  });
  document.getElementById('orderQty')?.addEventListener('input', () => document.getElementById('orderProduct').dispatchEvent(new Event('change')));
  document.getElementById('formOrder')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dealer = document.getElementById('orderDealer').value;
    const product = document.getElementById('orderProduct').value;
    const qty = parseInt(document.getElementById('orderQty').value, 10);
    const status = document.getElementById('orderStatus').value;
    const productObj = MIS_DATA.products.find(p => p.name === product);
    const amount = productObj ? productObj.unitPrice * qty : 0;
    const nextId = document.getElementById('formOrder').dataset.nextOrderId || ('ORD-2024-' + (Math.max(...MIS_DATA.orders.map(o => parseInt(o.id.split('-')[2], 10)), 1842) + 1));
    const today = new Date().toISOString().slice(0, 10);
    const payload = { id: nextId, date: today, dealer, product, qty, amount, status };
    try {
      const res = await fetch(API_BASE + '/api/orders', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        MIS_DATA.orders.unshift(payload);
        closeModal('modalOrder');
        renderSales();
        renderDashboard();
        toast('Order ' + nextId + ' created');
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err.error || 'Failed to create order', 'error');
      }
    } catch (err) {
      MIS_DATA.orders.unshift(payload);
      closeModal('modalOrder');
      renderSales();
      renderDashboard();
      toast('Order ' + nextId + ' created (offline)');
    }
  });
  document.getElementById('formDealer')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nextNum = MIS_DATA.dealers.length + 1;
    const code = 'DLR-' + String(nextNum).padStart(3, '0');
    const payload = {
      code,
      name: document.getElementById('dealerName').value.trim(),
      region: document.getElementById('dealerRegion').value,
      city: document.getElementById('dealerCity').value.trim(),
      contact: document.getElementById('dealerContact').value.trim(),
      ytdSales: parseInt(document.getElementById('dealerYtdSales').value, 10) || 0
    };
    try {
      const res = await fetch(API_BASE + '/api/dealers', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        MIS_DATA.dealers.push(payload);
        closeModal('modalDealer');
        renderDealers();
        renderDashboard();
        toast('Dealer ' + code + ' added');
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err.error || 'Failed to add dealer', 'error');
      }
    } catch (err) {
      MIS_DATA.dealers.push(payload);
      closeModal('modalDealer');
      renderDealers();
      renderDashboard();
      toast('Dealer ' + code + ' added (offline)');
    }
  });
  document.getElementById('formStock')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sku = document.getElementById('stockSku').value;
    const delta = parseInt(document.getElementById('stockAdjust').value, 10);
    const item = MIS_DATA.inventory.find(i => i.sku === sku);
    if (!item) return;
    try {
      const res = await fetch(API_BASE + '/api/inventory/' + encodeURIComponent(sku) + '/stock', {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjust: delta })
      });
      if (res.ok) {
        const data = await res.json();
        item.stock = data.stock;
        updateInventoryStatus(item);
        closeModal('modalStock');
        renderInventory();
        renderDashboard();
        toast('Stock updated: ' + item.name + ' = ' + item.stock + ' units');
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err.error || 'Update failed', 'error');
      }
    } catch (err) {
      item.stock = Math.max(0, item.stock + delta);
      updateInventoryStatus(item);
      closeModal('modalStock');
      renderInventory();
      renderDashboard();
      toast('Stock updated (offline)');
    }
  });
  document.getElementById('btnExportSales')?.addEventListener('click', () => exportTableCSV('sales'));
  document.getElementById('btnExportInventory')?.addEventListener('click', () => exportTableCSV('inventory'));
  document.getElementById('btnExportDealers')?.addEventListener('click', () => exportTableCSV('dealers'));
}

function openAdjustStockModal(sku) {
  const item = MIS_DATA.inventory.find(i => i.sku === sku);
  if (!item) return;
  document.getElementById('stockSku').value = sku;
  document.getElementById('stockProductName').textContent = item.name;
  document.getElementById('stockCurrent').textContent = item.stock;
  document.getElementById('stockAdjust').value = '';
  openModal('modalStock');
}

function exportTableCSV(which) {
  let headers = [], rows = [];
  if (which === 'sales') {
    headers = ['Order ID', 'Date', 'Dealer', 'Product', 'Qty', 'Amount', 'Status'];
    rows = getSortedOrders().map(o => [o.id, o.date, o.dealer, o.product, o.qty, o.amount, o.status]);
  } else if (which === 'inventory') {
    headers = ['SKU', 'Product Name', 'Category', 'Stock', 'Reorder Level', 'Status'];
    rows = getSortedInventory().map(i => [i.sku, i.name, i.category, i.stock, i.reorderLevel, i.status]);
  } else if (which === 'dealers') {
    headers = ['Code', 'Dealer Name', 'Region', 'City', 'Contact', 'YTD Sales'];
    rows = getSortedDealers().map(d => [d.code, d.name, d.region, d.city, d.contact, d.ytdSales]);
  }
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'vst-mis-' + which + '-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  toast('Exported ' + which + ' to CSV');
}

function initTableSorting() {
  function applySort(tableId, sortState, keyMap, render) {
    const table = document.getElementById(tableId);
    if (!table) return;
    table.querySelectorAll('th[data-sort]').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      const key = th.dataset.sort;
      if (sortState.key === key) th.classList.add(sortState.dir === 1 ? 'sorted-asc' : 'sorted-desc');
      th.onclick = () => {
        sortState.key = keyMap[key] || key;
        sortState.dir = sortState.key === key && sortState.dir === 1 ? -1 : 1;
        render();
        applySort(tableId, sortState, keyMap, render);
      };
    });
  }
  applySort('salesTable', salesSort, { id: 'id', date: 'date', dealer: 'dealer', product: 'product', qty: 'qty', amount: 'amount', status: 'status' }, renderSales);
  applySort('inventoryTable', inventorySort, { sku: 'sku', name: 'name', category: 'category', stock: 'stock', reorderLevel: 'reorderLevel', status: 'status' }, renderInventory);
  applySort('dealersTable', dealersSort, { code: 'code', name: 'name', region: 'region', city: 'city', contact: 'contact', ytdSales: 'ytdSales' }, renderDealers);
}
