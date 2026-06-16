import axios from 'axios';
import dotenv from 'dotenv';

// Load the keys from your .env file
dotenv.config();

// The specific Sandbox URL for Nomba's API
const NOMBA_BASE_URL = 'https://api.sandbox.nomba.com/v1';

export const getNombaToken = async () => {
  try {
    console.log('⏳ Attempting Nomba Handshake...');

    // We send a POST request to Nomba's "issue token" endpoint
    const response = await axios.post(
      `${NOMBA_BASE_URL}/auth/token/issue`,
      {
        grant_type: 'client_credentials',
        client_id: process.env.NOMBA_CLIENT_ID,
        client_secret: process.env.NOMBA_CLIENT_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'accountId': process.env.NOMBA_ACCOUNT_ID
        }
      }
    );

    // If successful, extract the token from the response
    const token = response.data.data.access_token;
    
    console.log('✅ Handshake Successful! Access Token Acquired.');
    return token;

  } catch (error: any) {
    console.error('❌ Nomba Handshake Failed:');
    if (error.response) {
      // This prints the exact reason Nomba rejected the keys
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
};