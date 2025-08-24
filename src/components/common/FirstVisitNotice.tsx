// src/components/common/FirstVisitNotice.tsx
import { useEffect, useState } from "react";

type Props = {
  storageKey: string;
  children: React.ReactNode;
};

export default function FirstVisitNotice({ storageKey, children }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) setOpen(true);
  }, [storageKey]);

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="first-visit-overlay">
      <div className="first-visit-modal">
        <button
          type="button"
          className="first-visit-close"
          aria-label="Close"
          onClick={dismiss}
        >
          ×
        </button>
        <div className="first-visit-body">{children}</div>
      </div>
    </div>
  );
}
