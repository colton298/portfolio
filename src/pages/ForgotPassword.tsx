import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Helmet } from "react-helmet-async";
import { auth } from "../firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setSending(true);
    console.log("[Forgot] sending reset to", email);

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("[Forgot] reset email sent");
      setSuccess("If an account exists for that email, a reset link has been sent.");
    } catch (err: any) {
      console.log("[Forgot] error:", err?.code, err?.message);
      const msg =
        err?.code === "auth/invalid-email" ? "Invalid email."
      : "Could not send reset email. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="auth-page">
      <Helmet>
        <title>Reset Password | To‑Do List</title>
        <meta
          name="description"
          content="Reset your To‑Do List password by requesting a secure email link."
        />
      </Helmet>

      <h2>Reset your password</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button className="button" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "0.75rem" }}>
        Remembered it? <a href="/login">Back to login</a>
      </p>
    </section>
  );
}
