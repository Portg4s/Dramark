export type PwaUpdateCallbacks = {
  onNeedRefresh: () => void;
  onOfflineReady?: () => void;
};

export type PwaUpdateSnapshot = {
  needsRefresh: boolean;
  offlineReady: boolean;
};

export type PwaUpdateListener = (snapshot: PwaUpdateSnapshot) => void;

export type RegisterServiceWorker = (callbacks: {
  immediate: true;
  onNeedRefresh: () => void;
  onOfflineReady: () => void;
}) => (reloadPage?: boolean) => Promise<void>;

let snapshot: PwaUpdateSnapshot = {
  needsRefresh: false,
  offlineReady: false
};

let applyWaitingUpdate: (() => Promise<void>) | undefined;
const listeners = new Set<PwaUpdateListener>();

function emitSnapshot() {
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribePwaUpdates(listener: PwaUpdateListener) {
  listeners.add(listener);
  listener(snapshot);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyPwaNeedRefresh() {
  snapshot = { ...snapshot, needsRefresh: true };
  emitSnapshot();
}

export function notifyPwaOfflineReady() {
  snapshot = { ...snapshot, offlineReady: true };
  emitSnapshot();
}

export function applyPwaUpdate() {
  return applyWaitingUpdate?.() ?? Promise.resolve();
}

export async function checkForPwaUpdates(serviceWorker?: ServiceWorkerContainer) {
  serviceWorker ??=
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      ? navigator.serviceWorker
      : undefined;

  if (!serviceWorker) {
    return false;
  }

  const registration = await serviceWorker.getRegistration();

  if (!registration) {
    return false;
  }

  await registration.update();
  return true;
}

export function registerPwaUpdates(registerServiceWorker: RegisterServiceWorker) {
  const updateServiceWorker = registerServiceWorker({
    immediate: true,
    onNeedRefresh: notifyPwaNeedRefresh,
    onOfflineReady: notifyPwaOfflineReady
  });

  applyWaitingUpdate = () => updateServiceWorker(true);
}
