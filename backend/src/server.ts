import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// 📂 UNIFIED STARTUP ENGINE STATE (Database Simulation)
export const db = {
    users: {} as Record<string, any>,
    notifications: {} as Record<string, any[]>,
    transactions: [] as any[]
};

const BASE_FARES: Record<string, number> = {
    "Yaba - Iyana Ipaja": 500,
    "Iyana Ipaja - Sango": 400,
    "Yaba - Sango (Direct)": 900
};

// 🧠 AI HEURISTIC PRICING GENERATOR
function calculateAIFare(route: string): { finalFare: number; multiplier: string } {
    const baseFare = BASE_FARES[route] || 500;
    const currentHour = new Date().getHours();
    const trafficDensity = 0.85; 
    const passengerDemand = 0.90; 

    let timeSurge = 0;
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
        timeSurge = 0.25;
    }

    const trafficSurge = 0.15 * trafficDensity;
    const demandSurge = 0.15 * passengerDemand;
    let totalMultiplier = 1 + timeSurge + trafficSurge + demandSurge;
    if (totalMultiplier > 1.50) totalMultiplier = 1.50;

    const optimizedFare = Math.round((baseFare * totalMultiplier) / 50) * 50;
    return { finalFare: optimizedFare, multiplier: totalMultiplier.toFixed(2) };
}

// ==========================================
// 🔐 LAYER 1: PUBLIC AUTH & REGISTRATION
// ==========================================
app.post('/api/v1/auth/register', (req: Request, res: Response) => {
    const { fullName, phoneNumber, role, licensePlate, assignedDomain } = req.body;

    if (!fullName || !phoneNumber || !role) {
        return res.status(400).json({ status: "error", message: "Missing core credentials." });
    }

    if (role === 'government') {
        return res.status(403).json({ status: "error", message: "Prohibited Action: Government provisioning is closed to public terminals." });
    }

    const systemId = `ow_${role}_${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeValue = `orderwatch://${role}/${systemId}`;

    const profile: any = {
        id: systemId,
        fullName,
        phoneNumber,
        role,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        qrCodeValue,
        createdAt: new Date().toISOString()
    };

    if (role === 'rider') {
        profile.walletBalance = 2500; 
        profile.virtualAccountNumber = `99${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        profile.virtualBankName = "Wema Bank (Nomba)";
    } else if (role === 'driver') {
        profile.walletBalance = 0;
        profile.vehiclePlate = licensePlate || "LAG-451-IK";
        profile.domain = assignedDomain || "Lagos Mainland";
        profile.activeRoute = "None";
        profile.activeFare = 0;
        profile.taxContributed = 0; // Tracks individual driver compliance
        profile.allowedRoutes = assignedDomain === "Lagos Mainland"
            ? ["Yaba - Iyana Ipaja", "Yaba - Sango (Direct)"]
            : ["Iyana Ipaja - Sango"];
    }

    db.users[systemId] = profile;
    db.notifications[systemId] = [
        {
            id: `ntf_${Math.random().toString(36).substr(2, 9)}`,
            title: "OrderWatch Profile Active 🛡️",
            message: `Welcome ${fullName}. Infrastructure framework initialization complete.`,
            timestamp: new Date().toISOString(),
            read: false
        }
    ];

    res.status(201).json({ status: "success", profile });
});

// ==========================================
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { phoneNumber, role } = req.body;
    
    // Find user in memory by phone and role
    const user = Object.values(db.users).find((u: any) => u.phoneNumber === phoneNumber && u.role === role);
    
    if (!user) {
        return res.status(404).json({ status: "error", message: "Invalid credentials or role mismatch." });
    }
    
    res.json({ status: "success", profile: user });
});

// ==========================================
// 🔔 LAYER 2: NOTIFICATION PIPELINE 
// ==========================================
app.get('/api/v1/notifications/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId as string; 
    const list = db.notifications[userId] || [];
    const unreadCount = list.filter((n: any) => !n.read).length;
    res.json({ status: "success", unreadCount, notifications: list });
});

// ==========================================
// 🧠 LAYER 3: BOUNDED AI DRIVER ROUTING
// ==========================================
app.post('/api/v1/driver/route-update', (req: Request, res: Response) => {
    const { driverId, selectedRoute } = req.body;
    const driver = db.users[driverId];

    if (!driver || driver.role !== 'driver') {
        return res.status(404).json({ status: "error", message: "Driver signature verification timeout." });
    }

    if (!driver.allowedRoutes.includes(selectedRoute)) {
        return res.status(403).json({ status: "error", message: "Boundary Fault: Route exceeds registered domain limits." });
    }

    const aiCalculation = calculateAIFare(selectedRoute);
    driver.activeRoute = selectedRoute;
    driver.activeFare = aiCalculation.finalFare;

    db.notifications[driverId].unshift({
        id: `ntf_${Math.random().toString(36).substr(2, 9)}`,
        title: "AI Route Optimization 📈",
        message: `Route updated to ${selectedRoute}. Fare calculated at ₦${driver.activeFare} (${aiCalculation.multiplier}x surge scale).`,
        timestamp: new Date().toISOString(),
        read: false
    });

    res.json({ status: "success", activeRoute: driver.activeRoute, aiOptimizedFare: driver.activeFare });
});

app.get('/api/v1/drivers/active', (req: Request, res: Response) => {
    // Filter drivers who have an active route set
    const activeDrivers = Object.values(db.users)
        .filter((u: any) => u.role === 'driver' && u.activeRoute && u.activeRoute !== "None")
        .map((d: any) => {
            // 🧠 DYNAMIC AI PRICING APPLIED IN REAL-TIME
            const aiFare = calculateAIFare(d.activeRoute);
            
            // Sync driver's profile with the current time-based AI fare
            d.activeFare = aiFare.finalFare;

            return {
                id: d.id,
                fullName: d.fullName,
                vehiclePlate: d.vehiclePlate,
                activeRoute: d.activeRoute,
                currentFare: aiFare.finalFare,
                surgeMultiplier: aiFare.multiplier
            };
        });

    res.json({ status: "success", drivers: activeDrivers });
});

// ==========================================
// 💸 LAYER 4: FINTECH GATEWAY WITH TAX SPLITS
// ==========================================
app.get('/api/v1/users/verify/:targetId', (req: Request, res: Response) => {
    const targetId = req.params.targetId as string;
    
    // Check if user node exists in our state memory
    let targetUser = db.users[targetId];

    // Fallback automatic generator to prevent empty state starvation on page refresh
    if (!targetUser) {
        return res.status(404).json({ status: "error", message: "Account node signature missing." });
    }

    // Return the absolute full profile block so balances sync instantly!
    res.json({ 
        status: "success", 
        fullName: targetUser.fullName, 
        role: targetUser.role,
        profile: targetUser 
    });
});

app.post('/api/v1/payments/p2p-transfer', (req: Request, res: Response) => {
    const { senderId, receiverId, amount } = req.body;
    
    const sender = db.users[senderId];
    const receiver = db.users[receiverId]; // Strict lookup. No fallbacks.

    if (!sender || !receiver) {
        return res.status(404).json({ status: "error", message: "Transaction Aborted: Node missing from memory." });
    }

    const numericAmount = Number(amount);
    if (sender.walletBalance < numericAmount) {
        return res.status(400).json({ status: "error", message: "Declined: Insufficient balance." });
    }

    const platformTaxAmt = numericAmount * 0.05; 
    const takeHomeDriverAmt = numericAmount - platformTaxAmt;

    sender.walletBalance -= numericAmount;
    receiver.walletBalance += takeHomeDriverAmt;
    if (receiver.role === 'driver') {
        receiver.taxContributed = (receiver.taxContributed || 0) + platformTaxAmt;
    }

    const txId = `tx_${Math.floor(100000 + Math.random() * 900000)}`;
    const txLog = { 
        txId, senderId, receiverId,
        senderName: sender.fullName, receiverName: receiver.fullName, 
        amount: numericAmount, taxDeducted: platformTaxAmt,
        timestamp: new Date().toISOString() 
    };
    db.transactions.unshift(txLog);

    res.json({ status: "success", txId, currentBalance: sender.walletBalance });
});

app.get('/api/v1/admin/analytics', (req: Request, res: Response) => {
    const grossRevenue = db.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const taxCollected = db.transactions.reduce((sum, tx) => sum + Number(tx.taxDeducted), 0);
    
    const allUsers = Object.values(db.users);
    const ridersCount = allUsers.filter((u: any) => u.role === 'rider').length;
    const driversCount = allUsers.filter((u: any) => u.role === 'driver').length;

    const operatorFleet = allUsers.filter((u: any) => u.role === 'driver').map((drv: any) => ({
        id: drv.id, name: drv.fullName, plate: drv.vehiclePlate,
        activeRoute: drv.activeRoute, taxPaid: drv.taxContributed || 0
    }));

    res.json({
        status: "success",
        analytics: {
            grossRevenue, taxCollected,
            ecosystem: { riders: ridersCount, drivers: driversCount, total: ridersCount + driversCount },
            operatorFleet,
            ledgerLogs: db.transactions.slice(0, 10)
        }
    });
});

// GET STREAM ROUTE FOR USER TRANSACTION HISTORY
app.get('/api/v1/transactions/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    // Filter history matching either as sender or receiver
    const history = db.transactions.filter(tx => tx.senderId === userId || tx.receiverId === userId);
    res.json({ status: "success", transactions: history });
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 ORDERWATCH CORE INFRASTRUCTURE SERVER ACTIVE ON PORT: ${PORT}`);
    console.log(`=================================================`);
});