// src/auth/SignOut.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Helmet } from "react-helmet-async";

export default function SignOut() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const next = params.get("next") || "/projects";

  const [stage, setStage] = useState<"confirm" | "signingOut" | "done">(
    "confirm"
  );

  const handleConfirm = async () => {
    setStage("signingOut");
    try {
      await signOut(auth);
      console.log("[SignOut] success");
      setStage("done");
      // optional: delay navigation so user sees the confirmation
      setTimeout(() => navigate(next, { replace: true }), 2000);
    } catch (err) {
      console.error("[SignOut] error", err);
      setStage("confirm"); // allow retry
    }
  };

  return (
    <section className="page">
      <Helmet>
        <title>Sign Out</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {stage === "confirm" && (
        <>
          <h2>Confirm Sign Out</h2>
          <p className="muted">Are you sure you want to sign out?</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="button" onClick={handleConfirm}>
              Yes, Sign Out
            </button>
            <button
              className="button outline"
              onClick={() => navigate(next, { replace: true })}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {stage === "signingOut" && (
        <>
          <h2>Signing Out…</h2>
          <p className="muted">One moment while we safely end your session.</p>
        </>
      )}

      {stage === "done" && (
        <>
          <h2>Signed Out</h2>
          <p className="muted">
            You have been signed out. Redirecting you back…
          </p>
        </>
      )}
    </section>
  );
}
