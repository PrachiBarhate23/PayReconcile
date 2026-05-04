import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../api/api";

const injectStyles = () => {
  if (typeof document !== "undefined" && !document.getElementById("app-ds")) {
    const s = document.createElement("style");
    s.id = "app-ds";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');:root{--bg:#f8f9fc;--surface:#fff;--surface2:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text2:#475569;--muted:#94a3b8;--blue:#2563eb;--blue-h:#1d4ed8;--blue-l:#eff6ff;--blue-b:#bfdbfe;--green:#059669;--green-l:#ecfdf5;--green-b:#a7f3d0;}.auth-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);font-family:'DM Sans';position:relative;overflow:hidden;}.auth-root::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.5;pointer-events:none;}.auth-card{position:relative;width:100%;max-width:420px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:3rem 2.75rem;box-shadow:0 12px 32px rgba(0,0,0,.1);z-index:1;animation:cardIn .5s cubic-bezier(.16,1,.3,1) both;}.auth-card::before{content:'';position:absolute;top:0;left:2rem;right:2rem;height:2px;background:linear-gradient(90deg,transparent,var(--blue),transparent);border-radius:0 0 4px 4px;}@keyframes cardIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}.auth-tag{font-family:'Space Mono';font-size:.62rem;letter-spacing:.2em;color:var(--blue);text-transform:uppercase;margin-bottom:6px;}.auth-title{font-family:'Syne';font-size:2.2rem;font-weight:800;color:var(--text);letter-spacing:-.02em;text-transform:uppercase;line-height:1;margin:0;}.auth-divider{width:36px;height:3px;background:var(--blue);border-radius:2px;margin:18px 0 28px;}.auth-error{background:var(--red-l);border:1px solid #fecaca;border-left:3px solid #dc2626;color:#dc2626;padding:10px 14px;font-size:.78rem;font-family:'Space Mono';border-radius:7px;margin-bottom:22px;}.auth-success{background:var(--green-l);border:1px solid var(--green-b);border-left:3px solid var(--green);color:var(--green);padding:10px 14px;font-size:.78rem;font-family:'Space Mono';border-radius:7px;margin-bottom:22px;}.auth-field{margin-bottom:18px;}.auth-lbl{display:block;font-family:'Space Mono';font-size:.6rem;letter-spacing:.15em;color:var(--text2);text-transform:uppercase;margin-bottom:7px;}.auth-inp{width:100%;background:var(--surface2);border:1.5px solid var(--border);color:var(--text);padding:11px 14px;font-family:'DM Sans';font-size:.92rem;border-radius:8px;outline:none;transition:border-color .2s;}.auth-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--surface);}.auth-submit{width:100%;background:var(--blue);color:#fff;border:none;padding:13px;border-radius:9px;font-family:'DM Sans';font-size:.9rem;font-weight:700;cursor:pointer;margin-top:22px;transition:background .15s;}.auth-submit:hover:not(:disabled){background:var(--blue-h);}.auth-submit:disabled{background:#bfdbfe;cursor:not-allowed;}.auth-footer{margin-top:24px;padding-top:18px;border-top:1px solid var(--border);text-align:center;font-size:.83rem;color:var(--muted);}.auth-link{color:var(--blue);text-decoration:none;font-weight:600;cursor:pointer;transition:color .15s;}.auth-link:hover{color:var(--blue-h);}.back-link{display:flex;align-items:center;gap:8px;color:var(--blue);text-decoration:none;font-size:.9rem;margin-bottom:24px;cursor:pointer;transition:color .15s;}.back-link:hover{color:var(--blue-h);}`;
    document.head.appendChild(s);
  }
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  injectStyles();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post(`/password-reset/forgot?email=${email}`);
      setSuccess(true);
    } catch (err: any) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-tag">Reset Password</div>
          <h2 className="auth-title">Check Your Email</h2>
          <div className="auth-divider" />

          <div className="auth-success">✓ Reset link sent successfully</div>

          <p className="text-sm text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and click the link to reset your password.
          </p>

          <p className="text-xs text-gray-500 mb-6">
            The link will expire in 1 hour.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="auth-submit"
          >
            Back to Login
          </button>

          <div className="auth-footer">
            Didn't receive the email?{" "}
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setError("");
              }}
              className="auth-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/login")}
          style={{ background: 'none', border: 'none' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="auth-tag">Reset Your Password</div>
        <h2 className="auth-title">Forgot Password?</h2>
        <div className="auth-divider" />

        <p className="text-sm text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleForgotPassword}>
          <div className="auth-field">
            <label htmlFor="forgot-email" className="auth-lbl">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              required
              placeholder="you@example.com"
              className="auth-inp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-footer">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="auth-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
