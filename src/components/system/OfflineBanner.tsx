import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator === 'undefined' ? false : !navigator.onLine
  );

  useEffect(() => {
    const updateOnlineState = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', updateOnlineState);
    window.addEventListener('offline', updateOnlineState);

    return () => {
      window.removeEventListener('online', updateOnlineState);
      window.removeEventListener('offline', updateOnlineState);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-viki px-4 py-2 text-sm font-semibold text-white">
      <WifiOff aria-hidden="true" size={16} />
      Mode hors connexion
    </div>
  );
}
