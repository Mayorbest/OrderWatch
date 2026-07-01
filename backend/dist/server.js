"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const nombaApi_1 = require("./nombaApi");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// 📂 UNIFIED IN-MEMORY DATABASE
exports.db = {
    users: {},
    notifications: {},
    transactions: []
};
// ==========================================
// 🧠 LAYER 2: AI SURGE PRICING ENGINE
// ==========================================
const BASE_FARES = {
    "Yaba - Iyana Ipaja": 500,
    "Iyana Ipaja - Sango": 400,
    "Yaba - Sango (Direct)": 900
};
function calculateAIFare(route) {
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
    if (totalMultiplier > 1.50)
        totalMultiplier = 1.50;
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
app.post('/api/v1/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, phoneNumber, role, licensePlate, assignedDomain } = req.body;
    if (!fullName || !phoneNumber || !role) {
        return res.status(400).json({ status: "error", message: "Missing core credentials." });
    }
    const systemId = `ow_${role}_${Math.floor(100000 + Math.random() * 900000)}`;
    const profile = {
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
            const nombaData = yield nombaApi_1.NombaService.createVirtualAccount(fullName, phoneNumber);
            profile.virtualAccountNumber = nombaData.accountNumber;
            profile.virtualBankName = nombaData.bankName || "Wema Bank (Nomba)";
        }
        catch (err) {
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
    exports.db.users[systemId] = profile;
    exports.db.notifications[systemId] = [{
            id: `ntf_${Math.random().toString(36).substr(2, 9)}`,
            title: "OrderWatch Node Active 🛡️",
            message: `Welcome ${fullName}. Secure infrastructure pipeline initialized.`,
            timestamp: new Date().toISOString(),
            read: false
        }];
    res.status(201).json({ status: "success", profile });
}));
app.post('/api/v1/auth/login', (req, res) => {
    const { phoneNumber, role } = req.body;
    const user = Object.values(exports.db.users).find(u => u.phoneNumber === phoneNumber && u.role === role);
    if (!user) {
        return res.status(404).json({ status: "error", message: "Node not found or role mismatch." });
    }
    res.json({ status: "success", profile: user });
});
app.get('/api/v1/users/verify/:targetId', (req, res) => {
    const targetUser = exports.db.users[req.params.targetId];
    if (!targetUser) {
        return res.status(404).json({ status: "error", message: "Account signature missing from memory." });
    }
    res.json({ status: "success", fullName: targetUser.fullName, role: targetUser.role, profile: targetUser });
});
// ==========================================
// 📡 LAYER 4: FLEET DISCOVERY & AI ROUTING
// ==========================================
app.get('/api/v1/drivers/active', (req, res) => {
    const activeDrivers = Object.values(exports.db.users)
        .filter(u => u.role === 'driver' && u.activeRoute && u.activeRoute !== "None")
        .map(d => {
        const aiFare = calculateAIFare(d.activeRoute);
        d.activeFare = aiFare.finalFare; // Sync memory
        return {
            id: d.id,
            fullName: d.fullName,
            vehiclePlate: d.vehiclePlate,
            activeRoute: d.activeRoute,
            baseFare: aiFare.baseFare, // EXPOSED: Base Fare
            currentFare: aiFare.finalFare, // EXPOSED: Surge Fare
            surgeMultiplier: aiFare.multiplier
        };
    });
    res.json({ status: "success", drivers: activeDrivers });
});
app.post('/api/v1/driver/route-update', (req, res) => {
    const { driverId, selectedRoute } = req.body;
    const driver = exports.db.users[driverId];
    if (!driver || driver.role !== 'driver')
        return res.status(404).json({ status: "error", message: "Node missing." });
    const aiCalculation = calculateAIFare(selectedRoute);
    driver.activeRoute = selectedRoute;
    driver.activeFare = aiCalculation.finalFare;
    exports.db.notifications[driverId].unshift({
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
app.post('/api/v1/payments/p2p-transfer', (req, res) => {
    var _a, _b;
    const { senderId, receiverId, amount } = req.body;
    const sender = exports.db.users[senderId];
    const receiver = exports.db.users[receiverId];
    if (!sender || !receiver)
        return res.status(404).json({ status: "error", message: "Node connection lost." });
    const numericAmount = Number(amount);
    if (sender.walletBalance < numericAmount)
        return res.status(400).json({ status: "error", message: "Insufficient assets." });
    // 🛡️ STRICT CLASSIFICATION: Driver gets paid = Transit Fare. Rider gets paid = P2P.
    const isTransitFare = receiver.role === 'driver';
    const txType = isTransitFare ? 'transit' : 'p2p';
    // Only tax transit fares (5%). Friend transfers are immune.
    const platformTaxAmt = isTransitFare ? (numericAmount * 0.05) : 0;
    const takeHomeAmt = numericAmount - platformTaxAmt;
    sender.walletBalance -= numericAmount;
    receiver.walletBalance += takeHomeAmt;
    if (isTransitFare) {
        receiver.taxContributed = (receiver.taxContributed || 0) + platformTaxAmt;
    }
    const txId = `tx_${txType}_${Math.floor(100000 + Math.random() * 900000)}`;
    const txLog = {
        txId, type: txType, senderId, receiverId,
        senderName: sender.fullName, receiverName: receiver.fullName,
        amount: numericAmount, taxDeducted: platformTaxAmt,
        timestamp: new Date().toISOString()
    };
    exports.db.transactions.unshift(txLog);
    // Dynamic Notifications
    (_a = exports.db.notifications[senderId]) === null || _a === void 0 ? void 0 : _a.unshift({
        id: `ntf_${Date.now()}`, title: isTransitFare ? "Transit Fare Paid 🔴" : "P2P Sent 🔴",
        message: `Authorized ₦${numericAmount} to ${receiver.fullName}.`, timestamp: new Date().toISOString(), read: false
    });
    (_b = exports.db.notifications[receiverId]) === null || _b === void 0 ? void 0 : _b.unshift({
        id: `ntf_${Date.now()}`, title: isTransitFare ? "Fare Received 🟢" : "P2P Received 🟢",
        message: `Received ₦${takeHomeAmt.toFixed(0)} from ${sender.fullName}.`, timestamp: new Date().toISOString(), read: false
    });
    res.json({ status: "success", txId, currentBalance: sender.walletBalance });
});
app.post('/api/v1/payments/topup', (req, res) => {
    const { userId, amount } = req.body;
    const user = exports.db.users[userId];
    if (!user)
        return res.status(404).json({ status: "error", message: "Node missing." });
    const numericAmount = Number(amount);
    user.walletBalance += numericAmount;
    const txLog = {
        txId: `tx_topup_${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'topup', senderId: "bank_node", receiverId: userId,
        senderName: user.virtualBankName || "Bank Deposit", receiverName: user.fullName,
        amount: numericAmount, taxDeducted: 0, timestamp: new Date().toISOString()
    };
    exports.db.transactions.unshift(txLog);
    res.json({ status: "success", txId: txLog.txId, currentBalance: user.walletBalance });
});
app.get('/api/v1/transactions/:userId', (req, res) => {
    const userId = req.params.userId;
    const history = exports.db.transactions.filter(tx => tx.senderId === userId || tx.receiverId === userId);
    res.json({ status: "success", transactions: history });
});
// ==========================================
// 🏛️ LAYER 6: ISOLATED GOVERNMENT AUDIT
// ==========================================
app.get('/api/v1/admin/analytics', (req, res) => {
    // 🛡️ STRICT ISOLATION: The government CANNOT see P2P or TopUps.
    const transitLogs = exports.db.transactions.filter(tx => tx.type === 'transit');
    const grossRevenue = transitLogs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const taxCollected = transitLogs.reduce((sum, tx) => sum + Number(tx.taxDeducted), 0);
    const allUsers = Object.values(exports.db.users);
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
app.get('/api/v1/notifications/:userId', (req, res) => {
    const list = exports.db.notifications[req.params.userId] || [];
    const unreadCount = list.filter(n => !n.read).length;
    res.json({ status: "success", unreadCount, notifications: list });
});
app.patch('/api/v1/notifications/:userId/clear', (req, res) => {
    const userId = req.params.userId;
    if (exports.db.notifications[userId]) {
        exports.db.notifications[userId].forEach(n => n.read = true);
    }
    res.json({ status: "success" });
});
app.listen(PORT, () => {
    console.log(`🚀 ORDERWATCH CORE INFRASTRUCTURE ACTIVE ON PORT: ${PORT}`);
});
