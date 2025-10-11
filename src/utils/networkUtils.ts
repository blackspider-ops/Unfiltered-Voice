export const isOnline = () => {
  return navigator.onLine;
};

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

export const handleNetworkError = (error: unknown) => {
  if (!isOnline()) {
    return 'You appear to be offline. Please check your internet connection.';
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please try again later.';
  }
  
  if (error && typeof error === 'object' && 'status' in error && typeof (error as any).status === 'number' && (error as any).status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error && typeof error === 'object' && 'status' in error && typeof (error as any).status === 'number' && (error as any).status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};