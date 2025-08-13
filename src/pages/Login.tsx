import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  reload,
} from "firebase/auth";
import { Helmet } from "react-helmet-async";
import { auth } from "../firebase";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [unverified, setUnverified] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResendMsg(null);
    setSubmitting(true);

    console.log("[Login] signing in", { emailLen: email.length });

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("[Login] signed in user:", cred.user.uid, "verified:", cred.user.emailVerified);

      await reload(cred.user);

      if (!cred.user.emailVerified) {
        setUnverified(true);
        await signOut(auth);
        return;
      }

      navigate("/todo");
    } catch (err: any) {
      console.log("[Login] error:", err?.code, err?.message);
      const message =
        err?.code === "auth/invalid-email" ? "Invalid email."
      : err?.code === "auth/user-disabled" ? "User disabled."
      : err?.code === "auth/user-not-found" ? "User not found."
      : err?.code === "auth/wrong-password" ? "Wrong password."
      : "Login failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setResendMsg(null);
    setError(null);
    console.log("[Login] resend verification requested");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setResendMsg("Verification email sent. Check your inbox.");
      console.log("[Login] verification re-sent to", cred.user.email);
    } catch (err: any) {
      console.log("[Login] resend error:", err?.code, err?.message);
      setError("Could not resend verification. Double-check your credentials and try again.");
    }
  };

  const checkVerified = async () => {
    setError(null);
    setResendMsg(null);
    console.log("[Login] manual verify check");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await reload(cred.user);
      const verified = cred.user.emailVerified;
      console.log("[Login] reload checked. verified:", verified);
      if (!verified) {
        await signOut(auth);
        setUnverified(true);
        setError("Still not verified. Please check your email and try again.");
        return;
      }
      navigate("/todo");
    } catch (err: any) {
      console.log("[Login] check verified error:", err?.code, err?.message);
      setError("Could not verify. Try logging in again.");
    }
  };

  return (
    <section className="auth-page">
      <Helmet>
        <title>Login | To‑Do List</title>
        <meta
          name="description"
          content="Log in to Colton Santiago’s To‑Do List to access your tasks."
        />
      </Helmet>

      <h2>Login to To‑Do List</h2>

      <form onSubmit={handleLogin} className="auth-form">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="login-password">Password</label>
        <PasswordInput
          inputId="login-password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          ariaLabel="Password"
        />

        <div className="form-row-center">
          <Link to="/forgot" className="auth-link">Forgot password?</Link>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: "0.75rem" }}>
        New here? <Link to="/signup">Create an account</Link>
      </p>

      {unverified && (
        <div className="card" style={{ marginTop: "1rem", padding: "0.75rem" }}>
          <p>
            Your email isn’t verified yet. Please click the link we sent to <b>{email}</b>.
          </p>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
            <button className="button" onClick={checkVerified}>I’ve verified — Check again</button>
            <button className="button outline" onClick={resendVerification}>Resend verification email</button>
          </div>
          {resendMsg && <p className="success-text" style={{ marginTop: ".5rem" }}>{resendMsg}</p>}
        </div>
      )}
    </section>
  );
}
