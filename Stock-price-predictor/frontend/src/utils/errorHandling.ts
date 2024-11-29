import axios from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // Handle specific HTTP status codes
    switch (status) {
      case 404:
        return {
          message: detail || 'Stock symbol not found. Please check the symbol and try again.',
          code: 'NOT_FOUND',
          status
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          status
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          status
        };
      default:
        return {
          message: detail || error.message || 'An unexpected error occurred.',
          code: 'UNKNOWN',
          status
        };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'CLIENT_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN'
  };
};
