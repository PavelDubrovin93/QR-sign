import { useCallback } from 'react';

interface UseApiWithRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
}

export const useApiWithRetry = (options: UseApiWithRetryOptions = {}) => {
  const { 
    maxRetries = 3, 
    initialDelay = 1000, 
    backoffMultiplier = 1.5 
  } = options;

  const retryApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T> => {
    let lastError: any;
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error: any) {
        lastError = error;
        
        const isConnectionError = 
          error?.response?.data?.message?.includes('ConnectionDoesNotExistError') ||
          error?.response?.data?.message?.includes('connection was closed') ||
          error?.response?.data?.error === 'Internal Server Error';
        
        if (!isConnectionError || attempt === maxRetries) {
          throw error;
        }
        
        console.log(`Попытка ${attempt} не удалась, пробуем еще раз через ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        delay *= backoffMultiplier;
      }
    }
    
    throw lastError;
  }, [maxRetries, initialDelay, backoffMultiplier]);

  return { retryApiCall };
}; 