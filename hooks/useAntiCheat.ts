import { useEffect, useCallback } from 'react';

export type FraudEvent = 'TAB_SWITCH' | 'COPY_PASTE' | 'MOUSE_OUT_OF_BOUNDS';

interface UseAntiCheatProps {
  onFraudEvent: (event: FraudEvent, metadata?: any) => void;
  isActive: boolean;
}

export function useAntiCheat({ onFraudEvent, isActive }: UseAntiCheatProps) {
  
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isActive) {
      onFraudEvent('TAB_SWITCH', { timestamp: new Date().toISOString() });
    }
  }, [isActive, onFraudEvent]);

  const handleBlur = useCallback(() => {
    if (isActive) {
      onFraudEvent('TAB_SWITCH', { type: 'window_blur', timestamp: new Date().toISOString() });
    }
  }, [isActive, onFraudEvent]);

  const handleCopyPaste = useCallback((e: ClipboardEvent) => {
    if (isActive) {
      e.preventDefault();
      onFraudEvent('COPY_PASTE', { type: e.type, timestamp: new Date().toISOString() });
    }
  }, [isActive, onFraudEvent]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (isActive && e.clientY <= 0) {
      onFraudEvent('MOUSE_OUT_OF_BOUNDS', { timestamp: new Date().toISOString() });
    }
  }, [isActive, onFraudEvent]);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isActive, handleVisibilityChange, handleBlur, handleCopyPaste, handleMouseLeave]);
}
