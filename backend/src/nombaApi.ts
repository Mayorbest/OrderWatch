import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

interface NombaAuthResponse {
    code: string;
    description: string;
    data: {
        access_token: string;
        expires_in: number;
    };
}

interface VirtualAccountResponse {
    code: string;
    description: string;
    data: {
        accountNumber: string;
        accountName: string;
        bankName: string;
    };
}

export class NombaService {
    // ✅ SENIOR DEV FIX: Using the correct Sandbox testing URL
    private static BASE_URL = 'https://sandbox.nomba.com/v1'; 
    private static ACCOUNT_ID = process.env.NOMBA_PARENT_ACCOUNT_ID;
    private static CLIENT_ID = process.env.NOMBA_CLIENT_ID;
    private static CLIENT_SECRET = process.env.NOMBA_PRIVATE_KEY;

    /**
     * 🔐 Step 1: Securely fetch the Access Token from Nomba
     */
    private static async getAccessToken(): Promise<string> {
        if (!this.CLIENT_ID || !this.CLIENT_SECRET || !this.ACCOUNT_ID) {
            throw new Error("Nomba Environment Variables are missing in .env");
        }

        const response = await fetch(`${this.BASE_URL}/auth/token/issue`, {
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

        const data = (await response.json()) as NombaAuthResponse;
        
        if (!response.ok || !data.data?.access_token) {
            throw new Error(`Nomba Auth Failed: ${data.description || 'Unknown Error'}`);
        }

        return data.data.access_token;
    }

    /**
     * 💳 Step 2: Generate a Dynamic Virtual Account for a Rider
     */
    public static async createVirtualAccount(userFullName: string, userPhone: string): Promise<VirtualAccountResponse['data']> {
        const token = await this.getAccessToken();

        const response = await fetch(`${this.BASE_URL}/accounts/virtual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accountId': this.ACCOUNT_ID as string,
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

        const data = (await response.json()) as VirtualAccountResponse;

        if (!response.ok || !data.data?.accountNumber) {
            throw new Error(`Virtual Account Creation Failed: ${data.description}`);
        }

        return data.data;
    }
}