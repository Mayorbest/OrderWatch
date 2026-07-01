import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { NombaService } from './nombaApi';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ==========================================
// 🛡️ LAYER 1: STRICT STATE INTERFACES
// ==========================================
type Role = 'rider' | 'driver' | 'government';
type TransactionType = 'transit' | 'p2p' | 'topup';

interface UserProfile {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: Role;
    avatarUrl: string;
    walletBalance: number;
    createdAt: string;
    // Rider specific
    virtualAccountNumber?: string;
    virtualBankName?: string;
    // Driver specific
    vehiclePlate?: string;
    domain?: string;
    activeRoute?: string;
    activeFare?: number;
    taxContributed?: number;
    allowedRoutes?: string[];
}

interface TransactionLog {
    txId: string;
    type: TransactionType;
    senderId: string;
    receiverId: string;
    senderName: string;
    receiverName: string;
    amount: number;
    taxDeducted: number;
    timestamp: string;
}

// 📂 UNIFIED IN-MEMORY DATABASE
export const db = {
    users: {} as Record<string, UserProfile>,
    notifications: {} as Record<string, any[]>,
    transactions: [] as TransactionLog[]
};

// ==========================================
// 🧠 LAYER 2: AI SURGE PRICING ENGINE
// ==========================================
const BASE_FARES: Record<string, number> = {
    "Yaba - Iyana Ipaja": 500,
    "Iyana Ipaja - Sango": 400,
    "Yaba - Sango (Direct)": 900
};

function calculateAIFare(route: string) {
    const baseFare = BASE_FARES[route] || 500;
    const currentHour = new Date().getHours();
    
    // Simulated environmental factors
    const trafficDensity = 0.85; 
    const passengerDemand = 0.90; 

    let timeSurge = 0;
    // Peak hour surge between 7AM-9AM and 5PM-7PM
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
        timeSurge = 0.25;
    }

    const trafficSurge = 0.15 * trafficDensity;
    const demandSurge = 0.15 * passengerDemand;
    let totalMultiplier = 1 + timeSurge + trafficSurge + demandSurge;
    
    // Cap maximum surge at 1.5x to protect riders
    if (totalMultiplier > 1.50) totalMultiplier = 1.50;

    const optimizedFare = Math.round((baseFare * totalMultiplier) / 50) * 50;
    
    return { 
        baseFare, // Now exported so UI can show the original price
        finalFare: optimizedFare, 
        multiplier: totalMultiplier.toFixed(2) 
    };
}

// ==========================================
// 🔐 LAYER 3: AUTHENTICATION & ONBOARDING
// ==========================================
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
    const { fullName, phoneNumber, role, licensePlate, assignedDomain } = req.body;

    if (!fullName || !phoneNumber || !role) {
        return res.status(400).json({ status: "error", message: "Missing core credentials." });
    }

    const systemId = `ow_${role}_${Math.floor(100000 + Math.random() * 900000)}`;

    const profile: UserProfile = {
        id: systemId,
        fullName,
        phoneNumber,
        role,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        walletBalance: 0,
        createdAt: new Date().toISOString()
    };

    if (role === 'rider') {
    profile.walletBalance = 0; 
    try {
        // 🔥 Live Sandbox Call
        const nombaData = await NombaService.createVirtualAccount(fullName, phoneNumber);
        profile.virtualAccountNumber = nombaData.accountNumber;
        profile.virtualBankName = nombaData.bankName || "Wema Bank (Nomba)";
    } catch (err) {
        console.error("Nomba Sandbox Error. Falling back to local generation:", err);
        // Fallback just in case internet drops during the pitch
        profile.virtualAccountNumber = `99${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        profile.virtualBankName = "Wema Bank (Nomba)";
    }
}
    else if (role === 'driver') {
        profile.vehiclePlate = licensePlate || "LAG-000-XX";
        profile.domain = assignedDomain || "Lagos Mainland";
        profile.activeRoute = "None";
        profile.activeFare = 0;
        profile.taxContributed = 0;
        profile.allowedRoutes = assignedDomain === "Lagos Mainland"
            ? ["Yaba - Iyana Ipaja", "Yaba - Sango (Direct)"]
            : ["Iyana Ipaja - Sango", "Sango - Oshodi"];
    }

    db.users[systemId] = profile;
    db.notifications[systemId] = [{
        id: `ntf_${Math.random().toString(36).substr(2, 9)}`,
        title: "OrderWatch Node Active 🛡️",
        message: `Welcome ${fullName}. Secure infrastructure pipeline initialized.`,
        timestamp: new Date().toISOString(),
        read: false
    }];

    res.status(201).json({ status: "success", profile });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { phoneNumber, role } = req.body;
    const user = Object.values(db.users).find(u => u.phoneNumber === phoneNumber && u.role === role);
    
    if (!user) {
        return res.status(404).json({ status: "error", message: "Node not found or role mismatch." });
    }
    
    res.json({ status: "success", profile: user });
});

app.get('/api/v1/users/verify/:targetId', (req: Request, res: Response) => {
    const targetUser = db.users[req.params.targetId as string];
    if (!targetUser) {
        return res.status(404).json({ status: "error", message: "Account signature missing from memory." });
    }
    res.json({ status: "success", fullName: targetUser.fullName, role: targetUser.role, profile: targetUser });
});

// ==========================================
// 📡 LAYER 4: FLEET DISCOVERY & AI ROUTING
// ==========================================
app.get('/api/v1/drivers/active', (req: Request, res: Response) => {
    const activeDrivers = Object.values(db.users)
        .filter(u => u.role === 'driver' && u.activeRoute && u.activeRoute !== "None")
        .map(d => {
            const aiFare = calculateAIFare(d.activeRoute!);
            d.activeFare = aiFare.finalFare; // Sync memory
            return {
                id: d.id,
                fullName: d.fullName,
                vehiclePlate: d.vehiclePlate,
                activeRoute: d.activeRoute,
                baseFare: aiFare.baseFare,       // EXPOSED: Base Fare
                currentFare: aiFare.finalFare,   // EXPOSED: Surge Fare
                surgeMultiplier: aiFare.multiplier
            };
        });

    res.json({ status: "success", drivers: activeDrivers });
});

app.post('/api/v1/driver/route-update', (req: Request, res: Response) => {
    const { driverId, selectedRoute } = req.body;
    const driver = db.users[driverId];

    if (!driver || driver.role !== 'driver') return res.status(404).json({ status: "error", message: "Node missing." });

    const aiCalculation = calculateAIFare(selectedRoute);
    driver.activeRoute = selectedRoute;
    driver.activeFare = aiCalculation.finalFare;

    db.notifications[driverId].unshift({
        id: `ntf_${Math.random().toString(36).substr(2, 9)}`,
        title: "AI Route Optimization 📈",
        message: `Route matrix shifted to ${selectedRoute}. Fare calculated at ₦${driver.activeFare} (${aiCalculation.multiplier}x surge).`,
        timestamp: new Date().toISOString(),
        read: false
    });

    res.json({ status: "success", activeRoute: driver.activeRoute, aiOptimizedFare: driver.activeFare });
});

// ==========================================
// 💸 LAYER 5: FINTECH SETTLEMENT GATEWAY
// ==========================================
app.post('/api/v1/payments/p2p-transfer', (req: Request, res: Response) => {
    const { senderId, receiverId, amount } = req.body;
    
    const sender = db.users[senderId];
    const receiver = db.users[receiverId];

    if (!sender || !receiver) return res.status(404).json({ status: "error", message: "Node connection lost." });
    
    const numericAmount = Number(amount);
    if (sender.walletBalance < numericAmount) return res.status(400).json({ status: "error", message: "Insufficient assets." });

    // 🛡️ STRICT CLASSIFICATION: Driver gets paid = Transit Fare. Rider gets paid = P2P.
    const isTransitFare = receiver.role === 'driver';
    const txType: TransactionType = isTransitFare ? 'transit' : 'p2p';
    
    // Only tax transit fares (5%). Friend transfers are immune.
    const platformTaxAmt = isTransitFare ? (numericAmount * 0.05) : 0; 
    const takeHomeAmt = numericAmount - platformTaxAmt;

    sender.walletBalance -= numericAmount;
    receiver.walletBalance += takeHomeAmt;
    
    if (isTransitFare) {
        receiver.taxContributed = (receiver.taxContributed || 0) + platformTaxAmt;
    }

    const txId = `tx_${txType}_${Math.floor(100000 + Math.random() * 900000)}`;
    const txLog: TransactionLog = { 
        txId, type: txType, senderId, receiverId,
        senderName: sender.fullName, receiverName: receiver.fullName, 
        amount: numericAmount, taxDeducted: platformTaxAmt,
        timestamp: new Date().toISOString() 
    };
    db.transactions.unshift(txLog);

    // Dynamic Notifications
    db.notifications[senderId]?.unshift({
        id: `ntf_${Date.now()}`, title: isTransitFare ? "Transit Fare Paid 🔴" : "P2P Sent 🔴",
        message: `Authorized ₦${numericAmount} to ${receiver.fullName}.`, timestamp: new Date().toISOString(), read: false
    });

    db.notifications[receiverId]?.unshift({
        id: `ntf_${Date.now()}`, title: isTransitFare ? "Fare Received 🟢" : "P2P Received 🟢",
        message: `Received ₦${takeHomeAmt.toFixed(0)} from ${sender.fullName}.`, timestamp: new Date().toISOString(), read: false
    });

    res.json({ status: "success", txId, currentBalance: sender.walletBalance });
});

app.post('/api/v1/payments/topup', (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    const user = db.users[userId];

    if (!user) return res.status(404).json({ status: "error", message: "Node missing." });

    const numericAmount = Number(amount);
    user.walletBalance += numericAmount; 

    const txLog: TransactionLog = {
        txId: `tx_topup_${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'topup', senderId: "bank_node", receiverId: userId,
        senderName: user.virtualBankName || "Bank Deposit", receiverName: user.fullName,
        amount: numericAmount, taxDeducted: 0, timestamp: new Date().toISOString()
    };
    
    db.transactions.unshift(txLog);
    res.json({ status: "success", txId: txLog.txId, currentBalance: user.walletBalance });
});

app.get('/api/v1/transactions/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const history = db.transactions.filter(tx => tx.senderId === userId || tx.receiverId === userId);
    res.json({ status: "success", transactions: history });
});

// ==========================================
// 🏛️ LAYER 6: ISOLATED GOVERNMENT AUDIT
// ==========================================
app.get('/api/v1/admin/analytics', (req: Request, res: Response) => {
    // 🛡️ STRICT ISOLATION: The government CANNOT see P2P or TopUps.
    const transitLogs = db.transactions.filter(tx => tx.type === 'transit');

    const grossRevenue = transitLogs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const taxCollected = transitLogs.reduce((sum, tx) => sum + Number(tx.taxDeducted), 0);
    
    const allUsers = Object.values(db.users);
    const ridersCount = allUsers.filter(u => u.role === 'rider').length;
    const driversCount = allUsers.filter(u => u.role === 'driver').length;

    const operatorFleet = allUsers.filter(u => u.role === 'driver').map(drv => ({
        id: drv.id, name: drv.fullName, plate: drv.vehiclePlate,
        activeRoute: drv.activeRoute, taxPaid: drv.taxContributed || 0
    }));

    res.json({
        status: "success",
        analytics: {
            grossRevenue, taxCollected, ridesBoardedCount: transitLogs.length,
            ecosystem: { riders: ridersCount, drivers: driversCount, total: ridersCount + driversCount },
            operatorFleet, ledgerLogs: transitLogs.slice(0, 15)
        }
    });
});

// ==========================================
// 🔔 LAYER 7: NOTIFICATION MANAGEMENT
// ==========================================
app.get('/api/v1/notifications/:userId', (req: Request, res: Response) => {
    const list = db.notifications[req.params.userId as string] || [];
    const unreadCount = list.filter(n => !n.read).length;
    res.json({ status: "success", unreadCount, notifications: list });
});

app.patch('/api/v1/notifications/:userId/clear', (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    if (db.notifications[userId]) {
        db.notifications[userId].forEach(n => n.read = true);
    }
    res.json({ status: "success" });
});

app.listen(PORT, () => {
    console.log(`🚀 ORDERWATCH CORE INFRASTRUCTURE ACTIVE ON PORT: ${PORT}`);
});