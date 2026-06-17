# 🚍 NombaTransit: The Cashless Danfo Ecosystem

![NombaTransit Banner](https://via.placeholder.com/1000x300/000000/22c55e?text=NombaTransit+-+Open-Loop+Transit+System)

**NombaTransit** is an open-loop, IoT-powered fare collection system built specifically for Nigeria's informal transport sector (Danfos and Koropes). Powered by **Nomba APIs**, it modernizes fare collection, eliminates cash leakages, handles offline dead-zones seamlessly, and automatically remits state taxes.

Built for the **Nomba x DevCareer Hackathon**.

---

## 🚀 The Problem & Our Solution
Nigeria's informal transit system relies 100% on physical cash, leading to severe revenue leakages, security risks, and zero data visibility for fleet managers or the government. 

**NombaTransit** solves this by bridging custom IoT hardware with a powerful Next.js/Node.js ecosystem:
1. **Riders** tap their NFC cards (or scan dynamic QR codes) to pay fares instantly from their Nomba Virtual Wallets.
2. **Drivers** use a live dashboard to dynamically change route prices and track daily shift revenue.
3. **Government/Unions** get a live dashboard tracking real-time boarding volume and automated 5% tax deductions.

---

## 🧠 Core Features & Architecture

* **The Offline Edge-Queue System:** Mobile internet drops frequently in moving vehicles. Our ESP32 hardware is programmed to cache taps locally when offline and fire a massive `Batch Sync` JSON payload to the backend the millisecond 4G is restored.
* **The "Debt & Blacklist" Engine:** If a rider taps offline with insufficient funds, their wallet enters negative debt, and their ID is instantly pushed to a hardware-level Blacklist to prevent future boarding until they top up.
* **Dynamic Route Pricing:** Drivers can update their active route (e.g., Yaba to Iyana-Ipaja), instantly synchronizing the new fare price to the hardware terminal.
* **Unified State Ledger:** A high-speed Node.js memory map acts as the central brain, ensuring the Rider, Driver, and Admin dashboards update in real-time.

---

## 💻 Tech Stack

**Frontend (Client Ecosystem):**
* Next.js (App Router)
* React & Tailwind CSS
* Lucide Icons (UI/UX Polish)
* Deployed on **Vercel**

**Backend (The Core Engine):**
* Node.js & Express.js
* TypeScript
* Axios (Nomba API Handshakes)
* Deployed on **Render**

**Hardware (IoT Validator):**
* ESP32 Microcontroller (Wi-Fi Enabled)
* MFRC522 RFID/NFC Module
* 16x2 I2C LCD Display & LED Indicators
* C++ (Arduino Framework)

---

## ⚙️ Local Development Setup

Want to run the NombaTransit software ecosystem locally?

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev