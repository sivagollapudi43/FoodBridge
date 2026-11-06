const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Checks backend API health and MongoDB connection status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API connection check failed:', error);
    return {
      success: false,
      error: error.message,
      database: { status: 'Unreachable' },
    };
  }
};

