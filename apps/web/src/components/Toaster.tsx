import { useEffect, useState } from 'react';

type Toast = {
  id: string;
  message: string;
};

const TOAST_EVENT = 'cvrum:toast';

export function Toaster(): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<Toast>;
      setToasts((current) => [...current, customEvent.detail]);
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== customEvent.detail.id));
      }, 4000);
    };

    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function pushToast(message: string): void {
  const detail: Toast = { id: crypto.randomUUID(), message };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }));
}
