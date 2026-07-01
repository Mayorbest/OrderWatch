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
exports.NombaService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Initialize environment variables
dotenv_1.default.config();
class NombaService {
    /**
     * 🔐 Step 1: Securely fetch the Access Token from Nomba
     */
    static getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.CLIENT_ID || !this.CLIENT_SECRET || !this.ACCOUNT_ID) {
                throw new Error("Nomba Environment Variables are missing in .env");
            }
            const response = yield fetch(`${this.BASE_URL}/auth/token/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accountId': this.ACCOUNT_ID,
                },
                body: JSON.stringify({
                    grant_type: "client_credentials",
                    client_id: this.CLIENT_ID,
                    client_secret: this.CLIENT_SECRET,
                }),
            });
            const data = (yield response.json());
            if (!response.ok || !((_a = data.data) === null || _a === void 0 ? void 0 : _a.access_token)) {
                throw new Error(`Nomba Auth Failed: ${data.description || 'Unknown Error'}`);
            }
            return data.data.access_token;
        });
    }
    /**
     * 💳 Step 2: Generate a Dynamic Virtual Account for a Rider
     */
    static createVirtualAccount(userFullName, userPhone) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const token = yield this.getAccessToken();
            const response = yield fetch(`${this.BASE_URL}/accounts/virtual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'accountId': this.ACCOUNT_ID,
                },
                body: JSON.stringify({
                    accountRef: `ow_ref_${Date.now()}`,
                    accountName: `OrderWatch - ${userFullName}`,
                    currency: "NGN",
                    // ✅ SENIOR DEV FIX: Passing a valid 11-digit mock BVN to bypass strict sandbox validation
                    bvn: "22222222222",
                    phoneNumber: userPhone,
                    email: "support@orderwatch.com"
                }),
            });
            const data = (yield response.json());
            if (!response.ok || !((_a = data.data) === null || _a === void 0 ? void 0 : _a.accountNumber)) {
                throw new Error(`Virtual Account Creation Failed: ${data.description}`);
            }
            return data.data;
        });
    }
}
exports.NombaService = NombaService;
// ✅ SENIOR DEV FIX: Using the correct Sandbox testing URL
NombaService.BASE_URL = 'https://sandbox.nomba.com/v1';
NombaService.ACCOUNT_ID = process.env.NOMBA_PARENT_ACCOUNT_ID;
NombaService.CLIENT_ID = process.env.NOMBA_CLIENT_ID;
NombaService.CLIENT_SECRET = process.env.NOMBA_PRIVATE_KEY;
