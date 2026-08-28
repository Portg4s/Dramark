export type AppToast = {
  id: string;
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
};

export type ToastListener = (toasts: AppToast[]) => void;

const toasts: AppToast[] = [];
const listeners = new Set<ToastListener>();
let fallbackToastId = 0;

function emitToasts() {
  const snapshot = [...toasts];
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  listener([...toasts]);

  return () => {
    listeners.delete(listener);
  };
}

export function showToast(toast: Omit<AppToast, 'id'> & { id?: string }) {
  const id =
    toast.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `toast-${(fallbackToastId += 1)}`);
  toasts.splice(0, toasts.length, { ...toast, id });
  emitToasts();

  return id;
}

export function dismissToast(id: string) {
  const index = toasts.findIndex((toast) => toast.id === id);

  if (index >= 0) {
    toasts.splice(index, 1);
    emitToasts();
  }
}
