# OrderWatch 🚌💳

![Nomba Hackathon](https://img.shields.io/badge/Event-Nomba_Hackathon-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0--MVP-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![ESP32](https://img.shields.io/badge/Hardware-ESP32%20IoT-red.svg)

> **An AI-powered, open-loop hardware ecosystem that digitizes payments and automates tax collection for Nigeria's informal transport sector using Nomba's infrastructure.**

---

## 📖 Table of Contents
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [UN Sustainable Development Goals (SDGs)](#-un-sustainable-development-goals)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Getting Started (Local Development)](#-getting-started)
- [Core API Endpoints](#-core-api-endpoints)
- [Future Roadmap (V2)](#-future-roadmap)

---

## 🚨 The Problem
Nigeria’s informal transport sector (Danfos and Koropes) moves millions of commuters daily but relies on a fragmented, cash-only system. This heavy cash dependence creates severe socio-economic bottlenecks:
* **Cash Friction:** Daily exact-change disputes, boarding delays, and security risks for drivers carrying physical cash.
* **Massive Revenue Leakage:** Millions of unrecorded micro-transactions result in zero digitized tax compliance for the government.
* **Operational Blind Spots:** Fleet operators lack data-driven insights to predict passenger demand or adjust pricing dynamically.
* **The Physical-Digital Divide:** Existing FinTech solutions are smartphone-dependent, which is often too slow and impractical for the fast-paced reality of boarding a public bus.

## 💡 The Solution
**OrderWatch** bridges the physical-digital divide by installing custom IoT tap-and-pay terminals directly into vehicles. 

Riders tap physical RFID cards or use their digital wallets to pay for rides. The system leverages **Nomba's FinTech APIs** to assign virtual bank accounts to riders for instant wallet funding. Under the hood, an AI engine dynamically calculates fares based on real-time traffic and demand. Simultaneously, the system deducts an atomic 5% platform tax at the point of transaction, routing the data to an isolated Government Analytics dashboard to ensure automated state tax compliance.

## 🌍 UN Sustainable Development Goals
OrderWatch actively tracks its impact on global sustainability targets:
* **SDG 8 (Decent Work & Economic Growth):** Formalizes revenue streams, protects the daily wages of informal drivers, and integrates the unbanked into the formal digital economy.
* **SDG 11 (Sustainable Cities & Communities):** Modernizes urban transit infrastructure, making public transportation safer, more efficient, and data-driven.

---

## ✨ Key Features
1. **IoT Hardware Integration:** ESP32 microcontrollers and RFID readers serve as physical point-of-sale terminals in buses.
2. **Nomba Virtual Accounts:** Automated generation of Nomba Sandbox virtual accounts for instantaneous rider top-ups via standard bank transfers.
3. **AI Surge Pricing:** Dynamic heuristic pricing engine that calculates optimal route fares based on time, traffic density, and passenger demand.
4. **Automated Tax Routing:** Strict backend classification (Transit vs. P2P) that automatically deducts a 5% tax on commercial rides and pushes it to a secure state ledger.
5. **Government Audit Dashboard:** An isolated, omni-view analytics terminal for regulators to track gross revenue, fleet compliance, and real-time transit logs.

---

## 🏗 System Architecture
* **Layer 1 (Hardware):** Physical ESP32 + RFID setup for fast boarding.
* **Layer 2 (Client UI):** Next.js dashboards segmented by strict role-based access (Rider, Driver, Government).
* **Layer 3 (Core API):** Node.js/Express.js gateway handling simulation state and transaction logic.
* **Layer 4 (FinTech Bridge):** The `NombaService` handling OAuth2 Bearer tokens and Virtual Account provisioning.
* **Layer 5 (AI Engine):** Real-time multiplier calculations attached to active driver routes.

---

## 🛠️ Technology Stack
### Frontend
* Next.js (React)
* Tailwind CSS
* Lucide React (Icons)

### Backend
* Node.js & Express.js
* TypeScript (Strict Mode)
* Nomba API (Sandbox Integration)

### Hardware (IoT)
* ESP32 Microcontroller
* MFRC522 RFID Module
* C++ (Arduino IDE)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* A Nomba Developer Account (Sandbox Keys)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/orderwatch.git](https://github.com/your-username/orderwatch.git)
cd orderwatch