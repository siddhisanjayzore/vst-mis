// Mock data for VST Tillers Tractors MIS (dummy)

const MIS_DATA = {
  kpi: {
    revenue: 1247,      // ₹ Cr
    unitsYTD: 42850,
    activeDealers: 1200,
    capacityPercent: 78
  },

  monthlySales: [
    { month: 'Aug', units: 3200 },
    { month: 'Sep', units: 3580 },
    { month: 'Oct', units: 4100 },
    { month: 'Nov', units: 3850 },
    { month: 'Dec', units: 4200 },
    { month: 'Jan', units: 4550 }
  ],

  productMix: [
    { name: 'Power Tillers', value: 62, color: '#2d7a2d' },
    { name: 'Tractors', value: 28, color: '#3d9a3d' },
    { name: 'Implements', value: 10, color: '#6bb86b' }
  ],

  orders: [
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
  ],

  inventory: [
    { sku: 'PT-165', name: '165 DI ES (16 HP)', category: 'Power Tiller', stock: 145, reorderLevel: 50, status: 'in-stock' },
    { sku: 'PT-135', name: '135 DI (13 HP)', category: 'Power Tiller', stock: 98, reorderLevel: 60, status: 'in-stock' },
    { sku: 'PT-130', name: '130 DI (13 HP)', category: 'Power Tiller', stock: 42, reorderLevel: 45, status: 'low-stock' },
    { sku: 'PT-95', name: '95 DI Ignito (9 HP)', category: 'Power Tiller', stock: 210, reorderLevel: 80, status: 'in-stock' },
    { sku: 'TR-S4', name: 'Shakti 4WD', category: 'Tractor', stock: 28, reorderLevel: 15, status: 'in-stock' },
    { sku: 'TR-C25', name: 'Compact 25', category: 'Tractor', stock: 18, reorderLevel: 12, status: 'in-stock' },
    { sku: 'IMP-RT', name: 'Rotavator', category: 'Implement', stock: 85, reorderLevel: 30, status: 'in-stock' },
    { sku: 'IMP-TL', name: 'Trailer', category: 'Implement', stock: 12, reorderLevel: 20, status: 'low-stock' }
  ],

  production: [
    { model: '165 DI ES', planned: 450, produced: 432, targetDate: '2024-02-28', status: 'on-track' },
    { model: '135 DI', planned: 380, produced: 365, targetDate: '2024-02-28', status: 'on-track' },
    { model: '130 DI', planned: 320, produced: 298, targetDate: '2024-02-28', status: 'delayed' },
    { model: '95 DI Ignito', planned: 520, produced: 510, targetDate: '2024-02-25', status: 'on-track' },
    { model: 'Shakti 4WD', planned: 80, produced: 72, targetDate: '2024-02-28', status: 'on-track' }
  ],

  productionUtilization: {
    tillers: 82,
    tractors: 72
  },

  // Product list with unit price for order form
  products: [
    { name: '165 DI ES', sku: 'PT-165', unitPrice: 375000 },
    { name: '135 DI', sku: 'PT-135', unitPrice: 210000 },
    { name: '130 DI', sku: 'PT-130', unitPrice: 195000 },
    { name: '95 DI Ignito', sku: 'PT-95', unitPrice: 115000 },
    { name: 'Shakti 4WD', sku: 'TR-S4', unitPrice: 700000 },
    { name: 'Compact 25', sku: 'TR-C25', unitPrice: 550000 },
    { name: 'Rotavator', sku: 'IMP-RT', unitPrice: 85000 },
    { name: 'Trailer', sku: 'IMP-TL', unitPrice: 65000 }
  ],

  dealers: [
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
  ]
};
