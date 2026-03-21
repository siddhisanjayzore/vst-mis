require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vst-mis-secret-key-change-in-production';
// CORS: allow file:// and localhost for login/register pages
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(__dirname));

// Explicit OPTIONS for auth routes (fixes 405 preflight when page opened as file://)
app.options('/api/auth/register', (req, res) => {
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});
app.options('/api/auth/login', (req, res) => {
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// Initialize Firebase Admin - uses FIREBASE_SERVICE_ACCOUNT env var (no JSON file needed)
let serviceAccount;
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('FIREBASE_SERVICE_ACCOUNT environment variable is required.');
  console.error('');
  console.error('Setup:');
  console.error('  1. Create a .env file in the project root');
  console.error('  2. Add: FIREBASE_SERVICE_ACCOUNT=\'<paste entire JSON from Firebase Console>\'');
  console.error('     Or copy serviceAccountKey.json content (minified, one line)');
  console.error('  3. See .env.example for format');
  console.error('');
  console.error('To get the JSON: Firebase Console > Project Settings > Service accounts > Generate new private key');
  process.exit(1);
}
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  console.error('FIREBASE_SERVICE_ACCOUNT must be valid JSON.');
  process.exit(1);
}
// Fix: env var often has literal \n in private_key - convert to real newlines
if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id || 'vst-mis'
});

const db = admin.firestore();

// Verify Firebase connection before starting
async function verifyFirebaseConnection() {
  try {
    await db.collection('users').limit(1).get();
    console.log('Firebase Firestore connected successfully.');
  } catch (err) {
    console.error('\n--- Firebase Connection Failed ---');
    console.error('Error:', err.message);
    if (err.code === 16 || (err.message && err.message.includes('UNAUTHENTICATED'))) {
      console.error('\nFix steps:');
      console.error('  1. Firebase Console > Project Settings > Service accounts > Generate new private key');
      console.error('  2. Update FIREBASE_SERVICE_ACCOUNT in .env with new key JSON');
      console.error('  3. Ensure Firestore is enabled: Firebase Console > Build > Firestore Database > Create database');
      console.error('  4. Check system clock is correct (Firebase uses timestamp validation)');
    }
    process.exit(1);
  }
}

// Collection references
const productsRef = db.collection('products');
const dealersRef = db.collection('dealers');
const inventoryRef = db.collection('inventory');
const ordersRef = db.collection('orders');
const productionRef = db.collection('production');
const kpiRef = db.collection('kpi');
const usersRef = db.collection('users');
const employeesRef = db.collection('employees');
const leaveRequestsRef = db.collection('leaveRequests');
const attendanceRef = db.collection('attendance');

async function seedData() {
  // Check if products exist
  const productsSnapshot = await productsRef.limit(1).get();
  if (!productsSnapshot.empty) {
    console.log('Data already seeded');
    return;
  }

  console.log('Seeding Firebase with initial data...');

  // Seed Products
  const products = [
    { name: '165 DI ES', sku: 'PT-165', unitPrice: 375000, category: 'Power Tiller' },
    { name: '135 DI', sku: 'PT-135', unitPrice: 210000, category: 'Power Tiller' },
    { name: '130 DI', sku: 'PT-130', unitPrice: 195000, category: 'Power Tiller' },
    { name: '95 DI Ignito', sku: 'PT-95', unitPrice: 115000, category: 'Power Tiller' },
    { name: 'Shakti 4WD', sku: 'TR-S4', unitPrice: 700000, category: 'Tractor' },
    { name: 'Compact 25', sku: 'TR-C25', unitPrice: 550000, category: 'Tractor' },
    { name: 'Rotavator', sku: 'IMP-RT', unitPrice: 85000, category: 'Implement' },
    { name: 'Trailer', sku: 'IMP-TL', unitPrice: 65000, category: 'Implement' }
  ];
  for (const p of products) {
    await productsRef.doc(p.sku).set(p);
  }

  // Seed Dealers
  const dealers = [
    { code: 'DLR-001', name: 'Agri Power Hub', region: 'South', city: 'Coimbatore', contact: '98765 43210', ytdSales: 24500000 },
    { code: 'DLR-002', name: 'Green Valley Tractors', region: 'North', city: 'Ludhiana', contact: '98765 43211', ytdSales: 18900000 },
    { code: 'DLR-003', name: 'Kisan Seva', region: 'West', city: 'Pune', contact: '98765 43212', ytdSales: 22100000 },
    { code: 'DLR-004', name: 'VST Motors Coimbatore', region: 'South', city: 'Coimbatore', contact: '98765 43213', ytdSales: 31200000 },
    { code: 'DLR-005', name: 'Farm Tech India', region: 'North', city: 'Chandigarh', contact: '98765 43214', ytdSales: 15600000 },
    { code: 'DLR-006', name: 'Rural Agri Mart', region: 'East', city: 'Kolkata', contact: '98765 43215', ytdSales: 17800000 },
    { code: 'DLR-007', name: 'Krishak Tractors', region: 'West', city: 'Ahmedabad', contact: '98765 43216', ytdSales: 19800000 },
    { code: 'DLR-008', name: 'Harvest Dealers', region: 'South', city: 'Bangalore', contact: '98765 43217', ytdSales: 26700000 },
    { code: 'DLR-009', name: 'South India Agri', region: 'South', city: 'Chennai', contact: '98765 43218', ytdSales: 23400000 },
    { code: 'DLR-010', name: 'North Farm Equip', region: 'North', city: 'Delhi', contact: '98765 43219', ytdSales: 28900000 }
  ];
  for (const d of dealers) {
    await dealersRef.doc(d.code).set(d);
  }

  // Seed Inventory
  const inventory = [
    { sku: 'PT-165', name: '165 DI ES (16 HP)', category: 'Power Tiller', stock: 145, reorderLevel: 50 },
    { sku: 'PT-135', name: '135 DI (13 HP)', category: 'Power Tiller', stock: 98, reorderLevel: 60 },
    { sku: 'PT-130', name: '130 DI (13 HP)', category: 'Power Tiller', stock: 42, reorderLevel: 45 },
    { sku: 'PT-95', name: '95 DI Ignito (9 HP)', category: 'Power Tiller', stock: 210, reorderLevel: 80 },
    { sku: 'TR-S4', name: 'Shakti 4WD', category: 'Tractor', stock: 28, reorderLevel: 15 },
    { sku: 'TR-C25', name: 'Compact 25', category: 'Tractor', stock: 18, reorderLevel: 12 },
    { sku: 'IMP-RT', name: 'Rotavator', category: 'Implement', stock: 85, reorderLevel: 30 },
    { sku: 'IMP-TL', name: 'Trailer', category: 'Implement', stock: 12, reorderLevel: 20 }
  ];
  for (const i of inventory) {
    await inventoryRef.doc(i.sku).set(i);
  }

  // Seed Orders
  const orders = [
    { id: 'ORD-2024-1842', date: '2024-02-12', dealer: 'Agri Power Hub', product: '165 DI ES', qty: 5, amount: 1875000, status: 'Dispatched' },
    { id: 'ORD-2024-1841', date: '2024-02-11', dealer: 'Green Valley Tractors', product: '135 DI', qty: 8, amount: 1680000, status: 'Delivered' },
    { id: 'ORD-2024-1840', date: '2024-02-10', dealer: 'Kisan Seva', product: '130 DI', qty: 12, amount: 2340000, status: 'Pending' },
    { id: 'ORD-2024-1839', date: '2024-02-09', dealer: 'VST Motors Coimbatore', product: '95 DI Ignito', qty: 15, amount: 1725000, status: 'Dispatched' },
    { id: 'ORD-2024-1838', date: '2024-02-08', dealer: 'Farm Tech India', product: 'Shakti 4WD', qty: 3, amount: 2100000, status: 'Delivered' },
    { id: 'ORD-2024-1837', date: '2024-02-07', dealer: 'Rural Agri Mart', product: '165 DI ES', qty: 4, amount: 1500000, status: 'Pending' },
    { id: 'ORD-2024-1836', date: '2024-02-06', dealer: 'Krishak Tractors', product: '135 DI', qty: 6, amount: 1260000, status: 'Delivered' },
    { id: 'ORD-2024-1835', date: '2024-02-05', dealer: 'Harvest Dealers', product: 'Rotavator', qty: 10, amount: 850000, status: 'Dispatched' },
    { id: 'ORD-2024-1834', date: '2024-02-04', dealer: 'South India Agri', product: '130 DI', qty: 7, amount: 1365000, status: 'Delivered' },
    { id: 'ORD-2024-1833', date: '2024-02-03', dealer: 'North Farm Equip', product: '95 DI Ignito', qty: 20, amount: 2300000, status: 'Pending' }
  ];
  for (const o of orders) {
    await ordersRef.doc(o.id).set(o);
  }

  // Seed Production
  const production = [
    { model: '165 DI ES', planned: 450, produced: 432, targetDate: '2024-02-28', status: 'on-track' },
    { model: '135 DI', planned: 380, produced: 365, targetDate: '2024-02-28', status: 'on-track' },
    { model: '130 DI', planned: 320, produced: 298, targetDate: '2024-02-28', status: 'delayed' },
    { model: '95 DI Ignito', planned: 520, produced: 510, targetDate: '2024-02-25', status: 'on-track' },
    { model: 'Shakti 4WD', planned: 80, produced: 72, targetDate: '2024-02-28', status: 'on-track' }
  ];
  for (const p of production) {
    await productionRef.add(p);
  }

  // Seed KPI
  await kpiRef.doc('revenue').set({ value: 1247 });
  await kpiRef.doc('unitsYTD').set({ value: 42850 });
  await kpiRef.doc('capacityPercent').set({ value: 78 });

  console.log('Seeding completed!');
}


// --- Authentication Middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// --- Authentication Routes (Public) ---

// Health check (no auth) - for testing Firebase connectivity
app.get('/api/health', async (req, res) => {
  try {
    await db.collection('users').limit(1).get();
    res.json({ ok: true, database: 'connected' });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

// Register (supports roles: dealer, manufacturer, admin, hr, user)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Only allow specific roles; default to "dealer" for new accounts
    const allowedRoles = ['dealer', 'manufacturer', 'admin', 'hr', 'user'];
    let userRole = (role || 'dealer').toLowerCase();
    if (!allowedRoles.includes(userRole)) {
      userRole = 'dealer';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: userRole
    };

    const userRef = usersRef.doc();
    await userRef.set(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: userRef.id, email: userData.email, name: userData.name, role: userData.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userRef.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (e) {
    console.error('Error registering user:', e);
    const msg = (e.code === 16 || (e.message && e.message.includes('UNAUTHENTICATED')))
      ? 'Database connection error. Check Firebase configuration.'
      : e.message;
    res.status(500).json({ error: msg });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const usersSnapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    if (usersSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, name: userData.name, role: userData.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user'
      }
    });
  } catch (e) {
    console.error('Error logging in:', e);
    const msg = (e.code === 16 || (e.message && e.message.includes('UNAUTHENTICATED')))
      ? 'Database connection error. Check Firebase configuration.'
      : e.message;
    res.status(500).json({ error: msg });
  }
});

// Verify token (check if user is authenticated)
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const userDoc = await usersRef.doc(req.user.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userData = userDoc.data();
    res.json({
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user'
      }
    });
  } catch (e) {
    console.error('Error verifying token:', e);
    res.status(500).json({ error: e.message });
  }
});

// Simple role-based authorization helper
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const userRole = (req.user && req.user.role) || 'user';
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

// --- Protected API Routes ---

app.get('/api/data', authenticateToken, async (req, res) => {
  try {
    // Fetch all collections
    const [ordersSnapshot, dealersSnapshot, inventorySnapshot, productsSnapshot, productionSnapshot, kpiSnapshot] = await Promise.all([
      ordersRef.orderBy('date', 'desc').get(),
      dealersRef.get(),
      inventoryRef.get(),
      productsRef.get(),
      productionRef.get(),
      kpiRef.get()
    ]);

    const jwtUser = req.user || {};
    const userRole = jwtUser.role || 'user';
    const userName = jwtUser.name || '';

    // Convert to arrays
    let orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date,
        dealer: data.dealer,
        product: data.product,
        qty: data.qty,
        amount: data.amount,
        status: data.status
      };
    });

    let dealers = dealersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        code: doc.id,
        name: data.name,
        region: data.region,
        city: data.city,
        contact: data.contact,
        ytdSales: data.ytdSales || 0
      };
    });

    const inventoryRows = inventorySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sku: doc.id,
        name: data.name,
        category: data.category,
        stock: data.stock,
        reorderLevel: data.reorderLevel
      };
    });

    let inventory = inventoryRows.map(r => ({
      ...r,
      status: r.stock <= r.reorderLevel ? 'low-stock' : 'in-stock'
    }));

    let products = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name,
        sku: doc.id,
        unitPrice: data.unitPrice
      };
    });

    let production = productionSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        model: data.model,
        planned: data.planned,
        produced: data.produced,
        targetDate: data.targetDate,
        status: data.status
      };
    });

    // Dealer-specific filtering: see only own dealer + own orders
    if (userRole === 'dealer' && userName) {
      orders = orders.filter(o => o.dealer === userName);
      dealers = dealers.filter(d => d.name === userName);
    }

    // Manufacturer: only dashboard/inventory/production (no dealer list, no orders list)
    if (userRole === 'manufacturer') {
      orders = [];
      dealers = [];
    }

    // HR: dashboard + reports only (hide operational datasets)
    if (userRole === 'hr') {
      orders = [];
      dealers = [];
      inventory = [];
      production = [];
      products = [];
    }

    // Get KPI values
    const kpi = { revenue: 1247, unitsYTD: 42850, activeDealers: dealers.length, capacityPercent: 78 };
    kpiSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (doc.id === 'revenue') kpi.revenue = data.value;
      if (doc.id === 'unitsYTD') kpi.unitsYTD = data.value;
      if (doc.id === 'capacityPercent') kpi.capacityPercent = data.value;
    });

    const monthlySales = [
      { month: 'Aug', units: 3200 }, { month: 'Sep', units: 3580 }, { month: 'Oct', units: 4100 },
      { month: 'Nov', units: 3850 }, { month: 'Dec', units: 4200 }, { month: 'Jan', units: 4550 }
    ];
    const productMix = [
      { name: 'Power Tillers', value: 62, color: '#2d7a2d' },
      { name: 'Tractors', value: 28, color: '#3d9a3d' },
      { name: 'Implements', value: 10, color: '#6bb86b' }
    ];
    const productionUtilization = { tillers: 82, tractors: 72 };

    res.json({
      orders,
      dealers,
      inventory,
      products,
      production,
      productionUtilization,
      kpi,
      monthlySales,
      productMix
    });
  } catch (e) {
    console.error('Error fetching data:', e);
    res.status(500).json({ error: e.message });
  }
});

// Orders can be created by dealers and admins (manufacturer doesn't access Sales/Orders)
app.post('/api/orders', authenticateToken, requireRole(['dealer', 'admin']), async (req, res) => {
  try {
    const { id, date, dealer, product, qty, amount, status } = req.body;
    if (!id || !date || !dealer || !product || qty == null || amount == null || !status) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    // Dealers can only create orders for themselves
    if ((req.user?.role || 'user') === 'dealer' && req.user?.name && dealer !== req.user.name) {
      return res.status(403).json({ error: 'Dealers can only create orders for their own account' });
    }
    await ordersRef.doc(id).set({ date, dealer, product, qty, amount, status });
    res.status(201).json({ id, date, dealer, product, qty, amount, status });
  } catch (e) {
    console.error('Error creating order:', e);
    res.status(500).json({ error: e.message });
  }
});

// Order status can be updated by admins
app.patch('/api/orders/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });
    const docRef = ordersRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });
    await docRef.update({ status });
    res.json({ id, status });
  } catch (e) {
    console.error('Error updating order status:', e);
    res.status(500).json({ error: e.message });
  }
});

// Dealer master can be managed by admins
app.post('/api/dealers', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { code, name, region, city, contact, ytdSales } = req.body;
    if (!code || !name || !region || !city || !contact) return res.status(400).json({ error: 'Missing fields' });
    await dealersRef.doc(code).set({ name, region, city, contact, ytdSales: ytdSales || 0 });
    res.status(201).json({ code, name, region, city, contact, ytdSales: ytdSales || 0 });
  } catch (e) {
    console.error('Error creating dealer:', e);
    res.status(500).json({ error: e.message });
  }
});

// Inventory adjustments only for manufacturers and admins
app.patch('/api/inventory/:sku/stock', authenticateToken, requireRole(['manufacturer', 'admin']), async (req, res) => {
  try {
    const { sku } = req.params;
    const { adjust } = req.body;
    if (adjust == null) return res.status(400).json({ error: 'adjust (number) required' });
    const docRef = inventoryRef.doc(sku);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'SKU not found' });
    const data = doc.data();
    const newStock = Math.max(0, data.stock + parseInt(adjust, 10));
    await docRef.update({ stock: newStock });
    res.json({ sku, stock: newStock });
  } catch (e) {
    console.error('Error updating inventory:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/next-order-id', authenticateToken, async (req, res) => {
  try {
    const ordersSnapshot = await ordersRef.get();
    let maxNum = 1842;
    ordersSnapshot.docs.forEach(doc => {
      const parts = doc.id.split('-');
      if (parts.length === 3 && parts[0] === 'ORD' && parts[1] === '2024') {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    res.json({ nextId: 'ORD-2024-' + (maxNum + 1) });
  } catch (e) {
    console.error('Error getting next order ID:', e);
    res.json({ nextId: 'ORD-2024-1843' });
  }
});

function diffDaysInclusive(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  const start = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const end = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  const diff = Math.floor((end - start) / (24 * 60 * 60 * 1000));
  return diff >= 0 ? (diff + 1) : null;
}

// --- HR (Employees + Leave Requests) ---
// Employees: HR/Admin only
app.get('/api/hr/employees', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const snap = await employeesRef.orderBy('createdAt', 'desc').get();
    const employees = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ employees });
  } catch (e) {
    console.error('Error fetching employees:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/hr/employees', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const { name, department, title, email, phone } = req.body || {};
    if (!name || !department || !title || !email) {
      return res.status(400).json({ error: 'name, department, title, email are required' });
    }

    const employeeId = 'EMP-' + String(Date.now()).slice(-6);
    const employee = {
      employeeId,
      name: String(name).trim(),
      department: String(department).trim(),
      title: String(title).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.userId || null
    };
    const ref = await employeesRef.add(employee);
    const stored = (await ref.get()).data();
    res.status(201).json({ employee: { id: ref.id, ...stored } });
  } catch (e) {
    console.error('Error creating employee:', e);
    res.status(500).json({ error: e.message });
  }
});

// Leaves: HR/Admin only (created for employees), HR/Admin can approve/reject
app.get('/api/hr/leaves', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const snap = await leaveRequestsRef.orderBy('requestedAt', 'desc').get();
    const leaves = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ leaves });
  } catch (e) {
    console.error('Error fetching leave requests:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/hr/leaves', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const { employeeId, employeeName, type, from, to, reason } = req.body || {};
    if (!employeeId || !employeeName || !type || !from || !to) {
      return res.status(400).json({ error: 'employeeId, employeeName, type, from, to are required' });
    }
    const days = diffDaysInclusive(from, to);
    if (!days) return res.status(400).json({ error: 'Invalid date range' });

    const leave = {
      employeeId: String(employeeId).trim(),
      employeeName: String(employeeName).trim(),
      type: String(type).trim(),
      from: String(from).trim(),
      to: String(to).trim(),
      days,
      reason: reason ? String(reason).trim() : '',
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.userId || null
    };
    const ref = await leaveRequestsRef.add(leave);
    const stored = (await ref.get()).data();
    res.status(201).json({ leave: { id: ref.id, ...stored } });
  } catch (e) {
    console.error('Error creating leave request:', e);
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/hr/leaves/:id/status', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ['Pending', 'Approved', 'Rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const ref = leaveRequestsRef.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Leave request not found' });
    await ref.update({
      status,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: req.user?.userId || null
    });
    res.json({ id, status });
  } catch (e) {
    console.error('Error updating leave status:', e);
    res.status(500).json({ error: e.message });
  }
});

// Attendance: HR/Admin only
app.get('/api/hr/attendance', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const month = String(req.query.month || '').trim(); // YYYY-MM
    let query = attendanceRef;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const start = month + '-01';
      const endMonth = new Date(month + '-01T00:00:00Z');
      endMonth.setUTCMonth(endMonth.getUTCMonth() + 1);
      const end = endMonth.toISOString().slice(0, 10);
      query = query.where('date', '>=', start).where('date', '<', end);
    }
    const snap = await query.orderBy('date', 'desc').get();
    const attendance = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ attendance });
  } catch (e) {
    console.error('Error fetching attendance:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/hr/attendance', authenticateToken, requireRole(['hr', 'admin']), async (req, res) => {
  try {
    const { employeeId, employeeName, date, status, notes } = req.body || {};
    const allowed = ['Present', 'Absent', 'Leave'];
    if (!employeeId || !employeeName || !date || !allowed.includes(status)) {
      return res.status(400).json({ error: 'employeeId, employeeName, date, status are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }
    const docId = String(employeeId).trim() + '_' + String(date).trim();
    const payload = {
      employeeId: String(employeeId).trim(),
      employeeName: String(employeeName).trim(),
      date: String(date).trim(),
      status,
      notes: notes ? String(notes).trim() : '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user?.userId || null
    };
    await attendanceRef.doc(docId).set(payload, { merge: true });
    const stored = (await attendanceRef.doc(docId).get()).data();
    res.status(201).json({ attendance: { id: docId, ...stored } });
  } catch (e) {
    console.error('Error saving attendance:', e);
    res.status(500).json({ error: e.message });
  }
});

// Start server only after Firebase connection is verified
verifyFirebaseConnection()
  .then(() => seedData())
  .then(() => {
    app.listen(PORT, () => {
      console.log('VST MIS server running at http://localhost:' + PORT);
      console.log('Database: Firebase Firestore');
      console.log('Login: open login.html | Register: open register.html');
    });
  })
  .catch((err) => { console.error(err); process.exit(1); });
