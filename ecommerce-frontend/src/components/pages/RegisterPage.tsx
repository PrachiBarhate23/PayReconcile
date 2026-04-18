import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api/auth";

const injectStyles = () => {
  if (typeof document !== "undefined" && !document.getElementById("app-ds")) {
    const s = document.createElement("style");
    s.id = "app-ds";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');:root{--bg:#f8f9fc;--surface:#fff;--surface2:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text2:#475569;--muted:#94a3b8;--blue:#2563eb;--blue-h:#1d4ed8;--blue-l:#eff6ff;--blue-b:#bfdbfe;--green:#059669;--green-l:#ecfdf5;--green-b:#a7f3d0;--red:#dc2626;--red-l:#fef2f2;--red-b:#fecaca;--amber:#d97706;--sh-lg:0 12px 32px rgba(0,0,0,.1);--r:10px;--font:'DM Sans',sans-serif;--mono:'Space Mono',monospace;--display:'Syne',sans-serif;}.auth-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);font-family:var(--font);position:relative;overflow:hidden;padding:2rem 0;}.auth-root::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.5;pointer-events:none;}.auth-root::after{content:'';position:absolute;top:-200px;right:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 70%);pointer-events:none;}.auth-card{position:relative;width:100%;max-width:500px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:2.5rem 2.5rem;box-shadow:var(--sh-lg);z-index:1;animation:cardIn .5s cubic-bezier(.16,1,.3,1) both;}.auth-card::before{content:'';position:absolute;top:0;left:2rem;right:2rem;height:2px;background:linear-gradient(90deg,transparent,var(--blue),transparent);border-radius:0 0 4px 4px;}@keyframes cardIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}.auth-tag{font-family:var(--mono);font-size:.62rem;letter-spacing:.2em;color:var(--blue);text-transform:uppercase;margin-bottom:6px;animation:fadeUp .4s .1s both;}.auth-title{font-family:var(--display);font-size:2rem;font-weight:800;color:var(--text);letter-spacing:-.02em;text-transform:uppercase;line-height:1;margin:0;animation:fadeUp .4s .15s both;}.auth-divider{width:36px;height:3px;background:var(--blue);border-radius:2px;margin:18px 0 20px;animation:expandX .5s .25s cubic-bezier(.16,1,.3,1) both;}@keyframes expandX{from{transform:scaleX(0);transform-origin:left;}to{transform:scaleX(1);transform-origin:left;}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}.auth-error{background:var(--red-l);border:1px solid var(--red-b);border-left:3px solid var(--red);color:var(--red);padding:10px 14px;font-size:.78rem;font-family:var(--mono);border-radius:7px;margin-bottom:20px;}.auth-field{margin-bottom:14px;animation:fadeUp .4s both;}.auth-lbl{display:block;font-family:var(--mono);font-size:.6rem;letter-spacing:.15em;color:var(--text2);text-transform:uppercase;margin-bottom:5px;}.auth-inp{width:100%;background:var(--surface2);border:1.5px solid var(--border);color:var(--text);padding:10px 12px;font-family:var(--font);font-size:.9rem;border-radius:8px;outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;}.auth-inp::placeholder{color:var(--muted);}.auth-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--surface);}.auth-submit-reg{width:100%;background:transparent;color:var(--blue);border:1.5px solid var(--blue-b);padding:12px;border-radius:9px;font-family:var(--font);font-size:.9rem;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s,transform .1s;margin-top:16px;animation:fadeUp .4s .4s both;}.auth-submit-reg:hover:not(:disabled){background:var(--blue-l);border-color:var(--blue);}.auth-submit-reg:active:not(:disabled){transform:scale(.99);}.auth-submit-reg:disabled{border-color:var(--border);color:var(--muted);cursor:not-allowed;}.auth-footer{margin-top:20px;padding-top:15px;border-top:1px solid var(--border);text-align:center;font-size:.83rem;color:var(--muted);animation:fadeUp .4s .45s both;}.auth-link{color:var(--blue);text-decoration:none;font-weight:600;}.auth-link:hover{color:var(--blue-h);}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}`;
    document.head.appendChild(s);
  }
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get plan from URL if arriving from Landing Page
  const queryParams = new URLSearchParams(window.location.search);
  const selectedPlan = queryParams.get("plan");

  injectStyles();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !username || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(""); setLoading(true);
    try {
      // Backend api might only destructure 'username' and 'password' currently.
      // But we pass the rest too just in case backend gets updated to accept them.
      await register(username, password);
      // Navigate to login with success flag
      navigate("/login?registered=true");
    } catch (err: any) {
      setError("Registration failed. Try a different username or email.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <p className="auth-tag">{selectedPlan ? `Plan: ${selectedPlan}` : "Join The Platform"}</p>
        <h2 className="auth-title">Create Account</h2>
        <div className="auth-divider" />
        
        {error && <div className="auth-error">⚠ {error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="grid-2">
            <div className="auth-field" style={{ animationDelay: '0.1s' }}>
              <label className="auth-lbl">First Name</label>
              <input required className="auth-inp" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="auth-field" style={{ animationDelay: '0.15s' }}>
              <label className="auth-lbl">Last Name</label>
              <input required className="auth-inp" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          
          <div className="auth-field" style={{ animationDelay: '0.2s' }}>
            <label className="auth-lbl">Email Address</label>
            <input type="email" required className="auth-inp" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="auth-field" style={{ animationDelay: '0.25s' }}>
            <label className="auth-lbl">Username</label>
            <input required className="auth-inp" placeholder="johndoe123" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="grid-2">
            <div className="auth-field" style={{ animationDelay: '0.3s' }}>
              <label className="auth-lbl">Password</label>
              <input type="password" required className="auth-inp" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="auth-field" style={{ animationDelay: '0.35s' }}>
              <label className="auth-lbl">Confirm Password</label>
              <input type="password" required className="auth-inp" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-reg">
            {loading ? "Creating account..." : "Register Now"}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}