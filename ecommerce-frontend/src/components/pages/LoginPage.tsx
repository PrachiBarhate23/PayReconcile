import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const injectStyles = () => {
  if (typeof document !== "undefined" && !document.getElementById("app-ds")) {
    const s = document.createElement("style");
    s.id = "app-ds";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');:root{--bg:#f8f9fc;--surface:#fff;--surface2:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text2:#475569;--muted:#94a3b8;--blue:#2563eb;--blue-h:#1d4ed8;--blue-l:#eff6ff;--blue-b:#bfdbfe;--green:#059669;--green-l:#ecfdf5;--green-b:#a7f3d0;--red:#dc2626;--red-l:#fef2f2;--red-b:#fecaca;--amber:#d97706;--amber-l:#fffbeb;--amber-b:#fde68a;--purple:#7c3aed;--purple-l:#f5f3ff;--purple-b:#ddd6fe;--sh:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);--sh-md:0 4px 14px rgba(0,0,0,.08);--sh-lg:0 12px 32px rgba(0,0,0,.1);--r:10px;--font:'DM Sans',sans-serif;--mono:'Space Mono',monospace;--display:'Syne',sans-serif;}.auth-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);font-family:var(--font);position:relative;overflow:hidden;}.auth-root::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.5;pointer-events:none;}.auth-root::after{content:'';position:absolute;top:-200px;right:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 70%);pointer-events:none;}.auth-card{position:relative;width:100%;max-width:440px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:3rem 2.75rem;box-shadow:var(--sh-lg);z-index:1;animation:cardIn .5s cubic-bezier(.16,1,.3,1) both;}.auth-card::before{content:'';position:absolute;top:0;left:2rem;right:2rem;height:2px;background:linear-gradient(90deg,transparent,var(--blue),transparent);border-radius:0 0 4px 4px;}@keyframes cardIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}.auth-tag{font-family:var(--mono);font-size:.62rem;letter-spacing:.2em;color:var(--blue);text-transform:uppercase;margin-bottom:6px;animation:fadeUp .4s .1s both;}.auth-title{font-family:var(--display);font-size:2.2rem;font-weight:800;color:var(--text);letter-spacing:-.02em;text-transform:uppercase;line-height:1;margin:0;animation:fadeUp .4s .15s both;}.auth-divider{width:36px;height:3px;background:var(--blue);border-radius:2px;margin:18px 0 28px;animation:expandX .5s .25s cubic-bezier(.16,1,.3,1) both;}@keyframes expandX{from{transform:scaleX(0);transform-origin:left;}to{transform:scaleX(1);transform-origin:left;}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}.auth-error{background:var(--red-l);border:1px solid var(--red-b);border-left:3px solid var(--red);color:var(--red);padding:10px 14px;font-size:.78rem;font-family:var(--mono);border-radius:7px;margin-bottom:22px;animation:fadeUp .2s both;}.auth-field{margin-bottom:18px;animation:fadeUp .4s both;}.auth-lbl{display:block;font-family:var(--mono);font-size:.6rem;letter-spacing:.15em;color:var(--text2);text-transform:uppercase;margin-bottom:7px;}.auth-inp{width:100%;background:var(--surface2);border:1.5px solid var(--border);color:var(--text);padding:11px 14px;font-family:var(--font);font-size:.92rem;border-radius:8px;outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;}.auth-inp::placeholder{color:var(--muted);}.auth-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--surface);}.auth-submit{width:100%;background:var(--blue);color:#fff;border:none;padding:13px;border-radius:9px;font-family:var(--font);font-size:.9rem;font-weight:700;letter-spacing:.04em;cursor:pointer;transition:background .15s,box-shadow .15s,transform .1s;margin-top:10px;animation:fadeUp .4s .4s both;}.auth-submit:hover:not(:disabled){background:var(--blue-h);box-shadow:0 4px 20px rgba(37,99,235,.3);}.auth-submit:active:not(:disabled){transform:scale(.99);}.auth-submit:disabled{background:#bfdbfe;color:#93c5fd;cursor:not-allowed;}.auth-footer{margin-top:24px;padding-top:18px;border-top:1px solid var(--border);text-align:center;font-size:.83rem;color:var(--muted);animation:fadeUp .4s .45s both;}.auth-link{color:var(--blue);text-decoration:none;font-weight:600;transition:color .15s;}.auth-link:hover{color:var(--blue-h);}.auth-extras{display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;margin-bottom:20px;animation:fadeUp .4s both;}.checkbox-lbl{display:flex;align-items:center;gap:6px;color:var(--text2);cursor:pointer;}`;
    document.head.appendChild(s);
  }
};

export function LoginPage() {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  injectStyles();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await login(username, password);
      loginUser(res.token);
      // Setup remember me token persistence logic if needed
      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
      } else {
        localStorage.removeItem("rememberedUser");
      }
    } catch (err: any) {
      setError("Invalid username or password");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <p className="auth-tag">Welcome Back</p>
        <h2 className="auth-title">Sign In</h2>
        <div className="auth-divider" />

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="auth-field" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="login-username" className="auth-lbl">Email or Username</label>
            <input id="login-username" required className="auth-inp" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="auth-field" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="login-password" className="auth-lbl">Password</label>
            <input id="login-password" type="password" placeholder="••••••••" required className="auth-inp" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="auth-extras" style={{ animationDelay: '0.35s' }}>
            <label className="checkbox-lbl">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember Me
            </label>
            <Link to="/forgot-password" className="auth-link" style={{ fontWeight: 500 }}>Forgot Password?</Link>
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Authenticating..." : "Login to account"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Register Here</Link>
        </div>
      </div>
    </div>
  );
}