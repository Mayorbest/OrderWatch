// We define the shape of Nomba's response so TypeScript knows exactly what to expect.
interface NombaAuthResponse {
    code: string;
    description: string;
    data?: {
        access_token: string;
        expires_in: number;
    };
}

const NOMBA_BASE_URL = 'https://api.nomba.com';
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

// 1. Function to Get & Cache the Access Token
export async function getNombaToken(): Promise<string> {
    // If we have a valid token in memory, use it! (Saves time & API calls)
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
        return cachedToken;
    }

    console.log("🔐 Requesting new Access Token from Nomba...");
    const response = await fetch(`${NOMBA_BASE_URL}/v1/auth/token/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accountId': process.env.NOMBA_ACCOUNT_ID as string
        },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: process.env.NOMBA_CLIENT_ID,
            client_secret: process.env.NOMBA_PRIVATE_KEY
        })
    });

    // Cast the response to our strict interface
    const result = (await response.json()) as NombaAuthResponse;

    if (result.code !== '00' || !result.data) {
        throw new Error(`Auth Failed: ${result.description}`);
    }

    // Cache the token and set it to expire 5 minutes (300000ms) before it actually does
    cachedToken = result.data.access_token;
    tokenExpiration = Date.now() + (result.data.expires_in * 1000) - 300000; 
    
    return cachedToken;
}

// 2. Function to generate the Checkout Order
export async function createOrder(amount: number, reference: string, email: string) {
    const token = await getNombaToken();
    
    console.log(`💸 Generating checkout link for ₦${amount}...`);
    const response = await fetch(`${NOMBA_BASE_URL}/v1/checkout/order`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accountId': process.env.NOMBA_ACCOUNT_ID as string
        },
        body: JSON.stringify({
            order: {
                orderReference: reference,
                amount: amount.toString(),
                currency: "NGN",
                customerEmail: email
            }
        })
    });

    return await response.json();
}