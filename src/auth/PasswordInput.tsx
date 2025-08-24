import { useId, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  ariaLabel?: string;
  inputId?: string;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  ariaLabel = "Password",
  inputId,
}: Props) {
  const genId = useId();
  const id = inputId || `pwd-${genId}`;
  const [show, setShow] = useState(false);

  // console.log LOCATION (PasswordInput): toggle visibility
  // Place: inside onClick below
  // console.log("[PasswordInput] toggled", !show);

  return (
    <div className="input-with-icon">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="icon-btn"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => {
          console.log("[PasswordInput] toggled", !show); // DEBUG
          setShow((s) => !s);
        }}
      >
        {show ? (
          /* eye-off icon */
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M2.1 3.51 3.51 2.1l18.39 18.39-1.41 1.41-2.28-2.28A11.73 11.73 0 0 1 12 20c-5.52 0-9.86-3.59-11.5-8a12.8 12.8 0 0 1 3.23-4.96L2.1 3.51ZM6.1 7.5a10.42 10.42 0 0 0-2.55 4.5C4.98 15.72 8.3 18 12 18c1.65 0 3.21-.41 4.57-1.13l-1.54-1.54a5 5 0 0 1-6.76-6.76L6.1 7.5Zm5.18 1.18a3 3 0 0 0-2.76 2.76l-1.7-1.7A4.99 4.99 0 0 1 11.28 8.7Zm1.43-.63c.43.08.85.26 1.2.52.56.42.98 1.03 1.14 1.74l-2.34-2.26Z" />
            <path fill="currentColor" d="M12 6c5.52 0 9.86 3.59 11.5 8-.62 1.78-1.69 3.37-3.08 4.64l-1.42-1.42A10.43 10.43 0 0 0 20.45 12C19.02 8.28 15.7 6 12 6a10.3 10.3 0 0 0-2.06.21L8.5 4.77A12.03 12.03 0 0 1 12 4Z" />
          </svg>
        ) : (
          /* eye icon */
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 4c5.52 0 9.86 3.59 11.5 8-1.64 4.41-5.98 8-11.5 8S2.14 16.41.5 12C2.14 7.59 6.48 4 12 4Zm0 2C7.98 6 4.75 8.44 3.32 12 4.75 15.56 7.98 18 12 18s7.25-2.44 8.68-6C19.25 8.44 16.02 6 12 6Zm0 2.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
