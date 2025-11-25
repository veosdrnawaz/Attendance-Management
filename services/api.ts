import { APPS_SCRIPT_URL } from '../constants';
import { ApiResponse } from '../types';

interface ApiOptions {
  action: string;
  payload?: any;
  token?: string;
  pin?: string;
}

export const callBackend = async <T>(options: ApiOptions): Promise<ApiResponse<T>> => {
  try {
    // We use POST for everything to avoid URL length limits and to easily pass the body
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      // 'text/plain' is used to avoid CORS preflight issues with Google Apps Script
      // The script will parse the body as JSON.
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({
        action: options.action,
        payload: options.payload || {},
        authToken: options.token, // Google ID Token
        pin: options.pin // Admin PIN if required
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Call Failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error or API misconfiguration"
    };
  }
};