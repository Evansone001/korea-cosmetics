import { useEffect, useState, useCallback } from 'react';

interface SessionTimeoutOptions {
  warningThreshold?: number; // Minutes before expiration to show warning (default: 5)
  onTimeout?: () => void;
  onWarning?: (timeRemaining: number) => void;
}

export const useSessionTimeout = (options: SessionTimeoutOptions = {}) => {
  const { warningThreshold = 5, onTimeout, onWarning } = options;
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const checkTokenExpiration = useCallback(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='));

    if (!token) {
      return null;
    }

    try {
      const tokenValue = token.split('=')[1];
      const payload = JSON.parse(atob(tokenValue.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const remaining = exp - now;
      const remainingMinutes = remaining / (1000 * 60);

      return remainingMinutes;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const checkExpiration = () => {
      const remaining = checkTokenExpiration();
      setTimeRemaining(remaining);

      if (remaining !== null) {
        if (remaining <= 0) {
          // Token has expired
          setShowWarning(false);
          if (onTimeout) {
            onTimeout();
          }
        } else if (remaining <= warningThreshold && !showWarning) {
          // Show warning when approaching threshold
          setShowWarning(true);
          if (onWarning) {
            onWarning(remaining);
          }
        } else if (remaining > warningThreshold) {
          // Hide warning if we have more time
          setShowWarning(false);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiration, 60 * 1000);

    // Initial check
    checkExpiration();

    return () => clearInterval(interval);
  }, [checkTokenExpiration, warningThreshold, showWarning, onTimeout, onWarning]);

  return {
    timeRemaining,
    showWarning,
    checkTokenExpiration,
  };
};
