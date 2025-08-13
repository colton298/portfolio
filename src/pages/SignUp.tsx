import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase";
import PasswordInput from "../components/PasswordInput";

export default function SignUp() {
  useEffect(() => {
    document.title = "Sign Up | To-Do List";
    // console.log LOCATION #1: mount
    console.log("[SignUp] mounted");
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = () => {
    if (!email || !password || !confirm) return "All fields are required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      // console.log LOCATION #2: validation
      console.log("[SignUp] validation error:", v);
      setError(v);
      return;
    }

    setSubmitting(true);
    // console.log LOCATION #3: before create
    console.log("[SignUp] creating user", { emailLen: email.length });

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // console.log LOCATION #4: created
      console.log("[SignUp] user created:", cred.user.uid);

      await sendEmailVerification(cred.user);
      // console.log LOCATION #5: verification sent
      console.log("[SignUp] verification email sent to:", cred.user.email);

      await signOut(auth);

      setSuccess("Account created! Check your email for a verification link, then log in.");
      setEmail(""); setPassword(""); setConfirm("");
    } catch (err: any) {
      // console.log LOCATION #6: error
      console.log("[SignUp] error:", err?.code, err?.message);
      const message =
        err?.code === "auth/email-already-in-use" ? "Email already in use."
      : err?.code === "auth/invalid-email" ? "Invalid email."
      : err?.code === "auth/weak-password" ? "Weak password."
      : "Sign up failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <h2>Create your account</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="signup-password">Password</label>
        <PasswordInput
          inputId="signup-password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          ariaLabel="Password"
          placeholder="At least 8 characters"
        />

        <label htmlFor="signup-confirm">Confirm Password</label>
        <PasswordInput
          inputId="signup-confirm"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          ariaLabel="Confirm password"
          placeholder="Re-enter password"
        />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: "0.75rem" }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </section>
  );
}
