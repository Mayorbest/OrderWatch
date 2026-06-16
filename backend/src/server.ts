import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ========================================================
// 🧠 UNIFIED TRANSACTIONS & STAKEHOLDER RECORD (The Brain)
// ========================================================
const db = {
  riders: {
    'Rider_Olamide_992': { name: 'Olamide A.', balance: 2500 },
    'Rider_Chioma_007': { name: 'Chioma B.', balance: 100 } 
  } as Record<string, { name: string; balance: number }>, 

  drivers: {
    'Driver_Kunle_404': { name: 'Kunle O.', totalEarnings: 0, vehiclePlate: 'LAG-420-AA', activeFare: 500 }
  } as Record<string, { name: string; totalEarnings: number; vehiclePlate: string; activeFare: number }>,

  governmentAnalytics: {
    totalTaxCollected: 0,
    totalRidesProcessed: 0,
    totalGrossRevenue: 0,
  },

  transactions: [] as any[],
  hardwareSignal: { flashGreen: false, message: "" },
  blacklist: new Set<string>() 
};

// ========================================================
// 🚪 DASHBOARD DATA ENDPOINTS
// ========================================================
app.get('/api/rider/:id', (req: Request, res: Response) => {
  const rider = db.riders[req.params.id as string];
  if (!rider) return res.status(404).json({ error: 'Rider not found' });
  res.status(200).json({ balance: rider.balance, name: rider.name });
});

app.get('/api/transactions', (req: Request, res: Response) => {
  res.status(200).json(db.transactions.slice(-5));
});

app.get('/api/driver/:id', (req: Request, res: Response) => {
  const driver = db.drivers[req.params.id as string];
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.status(200).json(driver);
});

// Fetch government analytics (STRICTLY TRANSPORT REVENUE ONLY)
app.get('/api/government/analytics', (req: Request, res: Response) => {
  
  // 1. Filter the master database to REMOVE wallet top-ups
  const officialRideLedger = db.transactions.filter(tx => tx.status !== 'WALLET_FUNDED');

  // 2. Send only the real rides to the Admin Dashboard
  res.status(200).json({
    analytics: db.governmentAnalytics,
    recentLedger: officialRideLedger.slice(-10) 
  });
});

// ========================================================
// 💰 RIDER: FUND WALLET ENDPOINT
// ========================================================
app.post('/api/rider/fund', (req: Request, res: Response) => {
  const { passengerId, amount } = req.body;
  const rider = db.riders[passengerId];

  if (!rider) return res.status(404).json({ error: 'Rider not found' });

  rider.balance += amount;
  db.transactions.unshift({
    id: `TOPUP-${Math.floor(Math.random() * 90000)}`,
    passenger: rider.name,
    driver: 'System (Bank Transfer)',
    amount: amount,
    status: 'WALLET_FUNDED',
    date: new Date().toISOString()
  });

  console.log(`\n💰 WALLET FUNDED: ${rider.name} topped up ₦${amount}. New Balance: ₦${rider.balance}`);
  res.status(200).json({ status: 'success', newBalance: rider.balance });
});

// ========================================================
// 🚌 DRIVER: UPDATE ROUTE & FARE ENDPOINT
// ========================================================
app.post('/api/driver/route', (req: Request, res: Response) => {
  const { driverId, newFare } = req.body;
  const driver = db.drivers[driverId];

  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  driver.activeFare = newFare; 
  console.log(`\n🚌 ROUTE UPDATED: ${driver.name} changed fare to ₦${newFare}`);
  res.status(200).json({ status: 'success', activeFare: driver.activeFare });
});

// ========================================================
// 💳 THE LIVE WEBHOOK (Online Payments & QR Scans)
// ========================================================
app.post('/api/webhook/nomba', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (payload.status !== 'success') return res.status(400).json({ error: 'Transaction failure' });

    const passengerId = payload.passengerId || 'Rider_Olamide_992';
    const driverId = payload.driverId || 'Driver_Kunle_404';
    
    const driver = db.drivers[driverId];
    const farePaid = driver ? driver.activeFare : 500; 

    const rider = db.riders[passengerId];
    if (rider) rider.balance -= farePaid;

    const tax = farePaid * 0.05;
    const driverEarnings = farePaid - tax;

    if (driver) driver.totalEarnings += driverEarnings;

    db.governmentAnalytics.totalTaxCollected += tax;
    db.governmentAnalytics.totalGrossRevenue += farePaid;
    db.governmentAnalytics.totalRidesProcessed += 1;

    db.transactions.unshift({
        id: `TRX-${Math.floor(Math.random() * 90000) + 10000}`,
        passenger: rider ? rider.name : passengerId,
        driver: driver ? driver.name : driverId,
        vehicle: driver ? driver.vehiclePlate : 'N/A',
        amount: farePaid,
        taxCollected: tax,
        date: new Date().toISOString()
    });

    console.log(`\n💳 SCAN SUCCESS! ${rider?.name} paid ₦${farePaid}. Ledger updated.`);
    res.status(200).json({ status: 'success', message: 'All stakeholder files synchronized.' });

  } catch (error) {
    res.status(500).json({ error: 'Internal Core Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Unified NombaTransit Master Engine running on http://127.0.0.1:${PORT}`);
});