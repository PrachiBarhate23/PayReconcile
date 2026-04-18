import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, TrendingUp, Lock, Zap, ArrowRight, ShieldCheck } from "lucide-react";

const injectStyles = () => {
  if (typeof document !== "undefined" && !document.getElementById("app-ds")) {
    const s = document.createElement("style");
    s.id = "app-ds";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');:root{--bg:#f8f9fc;--surface:#fff;--surface2:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text2:#475569;--muted:#94a3b8;--blue:#2563eb;--blue-h:#1d4ed8;--blue-l:#eff6ff;--blue-b:#bfdbfe;--green:#059669;--green-l:#ecfdf5;--green-b:#a7f3d0;--red:#dc2626;--red-l:#fef2f2;--red-b:#fecaca;--amber:#d97706;--amber-l:#fffbeb;--amber-b:#fde68a;--purple:#7c3aed;--purple-l:#f5f3ff;--purple-b:#ddd6fe;--sh:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);--sh-md:0 4px 14px rgba(0,0,0,.08);--sh-lg:0 12px 32px rgba(0,0,0,.1);--r:10px;--font:'DM Sans',sans-serif;--mono:'Space Mono',monospace;--display:'Syne',sans-serif;}.lp-root{min-height:100vh;background:var(--bg);font-family:var(--font);color:var(--text);position:relative;overflow-x:hidden;}.lp-root::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.6;pointer-events:none;z-index:0;}.lp-nav{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:1.5rem 4rem;background:rgba(255,255,255,0.8);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);}.lp-logo{font-family:var(--display);font-size:1.5rem;font-weight:800;color:var(--blue);letter-spacing:-0.05em;text-transform:uppercase;display:flex;align-items:center;gap:8px;}.lp-logo span{color:var(--text);}.lp-nav-links{display:flex;gap:2rem;align-items:center;}.lp-nav-link{font-size:0.9rem;font-weight:600;color:var(--text2);text-decoration:none;transition:color 0.2s;}.lp-nav-link:hover{color:var(--blue);}.lp-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.75rem 1.5rem;background:var(--blue);color:#fff;border:none;border-radius:8px;font-family:var(--font);font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}.lp-btn-primary:hover{background:var(--blue-h);transform:translateY(-1px);box-shadow:0 8px 25px rgba(37,99,235,0.3);}.lp-btn-primary:active{transform:translateY(0);}.lp-btn-secondary{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.75rem 1.5rem;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;font-family:var(--font);font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s;}.lp-btn-secondary:hover{background:var(--surface2);border-color:var(--blue-b);color:var(--blue);}.lp-hero{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:8rem 2rem 6rem;text-align:center;display:flex;flex-direction:column;align-items:center;}.lp-tag{display:inline-block;padding:0.4rem 1.2rem;background:var(--blue-l);color:var(--blue);border:1px solid var(--blue-b);border-radius:20px;font-family:var(--mono);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;margin-bottom:1.5rem;animation:fadeUp 0.5s ease both;}.lp-title{font-family:var(--display);font-size:4.5rem;font-weight:800;line-height:1.1;letter-spacing:-0.03em;color:var(--text);margin-bottom:1.5rem;max-width:900px;animation:fadeUp 0.6s 0.1s ease both;}.lp-title span{color:var(--blue);position:relative;}.lp-desc{font-size:1.2rem;color:var(--text2);max-width:650px;margin:0 auto 2.5rem;line-height:1.6;animation:fadeUp 0.6s 0.2s ease both;}.lp-hero-actions{display:flex;gap:1rem;justify-content:center;animation:fadeUp 0.6s 0.3s ease both;}.lp-section{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:6rem 2rem;}.lp-section-title{text-align:center;font-family:var(--display);font-size:2.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:3rem;color:var(--text);}.lp-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:2rem;}.lp-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:2.5rem;transition:all 0.3s;position:relative;overflow:hidden;box-shadow:var(--sh);}.lp-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--blue);transform:scaleX(0);transform-origin:left;transition:transform 0.3s;}.lp-card:hover{transform:translateY(-5px);box-shadow:var(--sh-lg);border-color:var(--blue-b);}.lp-card:hover::before{transform:scaleX(1);}.lp-card-icon{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;}.bg-blue-soft{background:var(--blue-l);color:var(--blue);}.bg-green-soft{background:var(--green-l);color:var(--green);}.bg-purple-soft{background:var(--purple-l);color:var(--purple);}.bg-amber-soft{background:var(--amber-l);color:var(--amber);}.lp-card-title{font-size:1.2rem;font-weight:700;color:var(--text);margin-bottom:0.75rem;font-family:var(--display);}.lp-card-text{font-size:0.95rem;color:var(--text2);line-height:1.6;}.lp-stats{position:relative;z-index:1;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:4rem 2rem;display:flex;justify-content:space-around;flex-wrap:wrap;gap:2rem;box-shadow:var(--sh-md);}.lp-stat{text-align:center;}.lp-stat-val{font-family:var(--mono);font-size:3.5rem;font-weight:700;color:var(--blue);line-height:1;margin-bottom:0.5rem;}.lp-stat-lbl{font-size:0.9rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:0.1em;}.lp-cta{position:relative;z-index:1;background:var(--blue);color:white;padding:6rem 2rem;text-align:center;border-radius:24px;max-width:1100px;margin:4rem auto;box-shadow:var(--sh-lg);overflow:hidden;}.lp-cta::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);}.lp-cta-title{font-family:var(--display);font-size:3rem;font-weight:800;margin-bottom:1.5rem;position:relative;z-index:2;}.lp-cta-desc{font-size:1.1rem;opacity:0.9;max-width:500px;margin:0 auto 2.5rem;position:relative;z-index:2;}.lp-btn-cta{display:inline-flex;align-items:center;justify-content:center;padding:1rem 2rem;background:#fff;color:var(--blue);border:none;border-radius:8px;font-family:var(--font);font-size:1.05rem;font-weight:700;cursor:pointer;transition:all 0.2s;position:relative;z-index:2;}.lp-btn-cta:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,0.15);}.lp-footer{position:relative;z-index:1;border-top:1px solid var(--border);background:var(--surface);padding:3rem 4rem;display:flex;justify-content:space-between;align-items:center;}.lp-footer-copy{font-size:0.85rem;color:var(--muted);font-family:var(--mono);}@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}@media(max-width:768px){.lp-title{font-size:2.8rem;}.lp-nav{padding:1rem 1.5rem;}.lp-nav-links{display:none;}.lp-stat-val{font-size:2.5rem;}.lp-hero{padding:5rem 1rem;}.lp-footer{flex-direction:column;gap:1rem;text-align:center;}}`;
    document.head.appendChild(s);
  }
};

export function LandingPage() {
  const navigate = useNavigate();
  injectStyles();

  return (
    <div className="lp-root">
      {/* Navigation */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <ShieldCheck size={28} /> Pay<span>Rec</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How it Works</a>
          <a href="#pricing" className="lp-nav-link">Pricing</a>
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'var(--green-l)', 
            color: 'var(--green)', 
            padding: '2px 8px', 
            borderRadius: '12px',
            border: '1px solid var(--green-b)',
            fontWeight: 800,
            fontFamily: 'var(--mono)'
          }}>CI/CD ACTIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="lp-btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="lp-btn-primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-tag">Payment Infrastructure v2.0</div>
        <h1 className="lp-title">
          Payment Reconciliation & <br /> <span>Failure Recovery</span>
        </h1>
        <p className="lp-desc">
          Detect and automatically resolve payment-order mismatches. Gain absolute clarity with ledger-grade audit trails and seamless integrations.
        </p>
        <div className="lp-hero-actions">
          <button className="lp-btn-primary" onClick={() => navigate("/register")}>
            Start Free Trial <ArrowRight size={18} />
          </button>
          <button className="lp-btn-secondary">
            View Live Demo
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="lp-stats">
        <div className="lp-stat">
          <div className="lp-stat-val">99.9%</div>
          <div className="lp-stat-lbl">Uptime</div>
        </div>
        <div className="lp-stat">
          <div className="lp-stat-val">&lt;50ms</div>
          <div className="lp-stat-lbl">Latency</div>
        </div>
        <div className="lp-stat">
          <div className="lp-stat-val">100+</div>
          <div className="lp-stat-lbl">Currencies</div>
        </div>
        <div className="lp-stat">
          <div className="lp-stat-val">∞</div>
          <div className="lp-stat-lbl">Transactions</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="lp-section">
        <h2 className="lp-section-title">Enterprise-Grade Financial Stack</h2>
        <div className="lp-grid">
          <div className="lp-card">
            <div className="lp-card-icon bg-blue-soft">
              <CheckCircle size={28} />
            </div>
            <h3 className="lp-card-title">Auto-Reconciliation</h3>
            <p className="lp-card-text">Our engine automatically flags payment-order mismatches in milliseconds and triggers refunds without any manual intervention.</p>
          </div>

          <div className="lp-card">
            <div className="lp-card-icon bg-green-soft">
              <TrendingUp size={28} />
            </div>
            <h3 className="lp-card-title">Settlement Analytics</h3>
            <p className="lp-card-text">Daily and weekly settlement summaries with built-in tax calculation and payout tracking algorithms.</p>
          </div>

          <div className="lp-card">
            <div className="lp-card-icon bg-purple-soft">
              <Lock size={28} />
            </div>
            <h3 className="lp-card-title">Immutable Ledger</h3>
            <p className="lp-card-text">Every transaction is recorded on our 100% audit-safe, append-only ledger using cryptographic hashing.</p>
          </div>

          <div className="lp-card">
            <div className="lp-card-icon bg-amber-soft">
              <Zap size={28} />
            </div>
            <h3 className="lp-card-title">Real-Time Routing</h3>
            <p className="lp-card-text">Intelligently route transactions across multiple gateways to ensure maximum approval rates.</p>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section id="how-it-works" className="lp-section" style={{ background: 'var(--surface2)', borderRadius: '32px' }}>
        <h2 className="lp-section-title">How It Works</h2>
        <div className="lp-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>1️⃣</div>
            <h4 className="lp-card-title">Connect Gateway</h4>
            <p className="lp-card-text">Connect your Stripe or AWS accounts in seconds with our secure OAuth flow.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>2️⃣</div>
            <h4 className="lp-card-title">Run Reconciliation</h4>
            <p className="lp-card-text">Our engine scans for discrepancies between payments and your database records.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>3️⃣</div>
            <h4 className="lp-card-title">Auto-Recover</h4>
            <p className="lp-card-text">Mismatches are automatically resolved via refunds or state corrections.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="lp-section">
        <h2 className="lp-section-title">Simple Transparent Pricing</h2>
        <div className="lp-grid">
          {/* Starter Plan */}
          <div className="lp-card" style={{ textAlign: 'center' }}>
            <div className="lp-tag" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>Starter</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>$0<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left', display: 'inline-block', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ 100 Reconciliations</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Basic Dashboard</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Community Support</li>
            </ul>
            <button className="lp-btn-secondary" style={{ width: '100%' }}>Get Started</button>
          </div>

          {/* Pro Plan */}
          <div className="lp-card" style={{ textAlign: 'center', borderColor: 'var(--blue)', transform: 'scale(1.05)', zIndex: 2, boxShadow: 'var(--sh-lg)' }}>
            <div className="lp-tag">Most Popular</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, margin: '1rem 0', color: 'var(--blue)' }}>$29<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left', display: 'inline-block', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ Unlimited Reconciliations</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Real-time Alerts</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Priority Email Support</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ API Access</li>
            </ul>
            <button className="lp-btn-primary" style={{ width: '100%' }}>Try Pro Free</button>
          </div>

          {/* Enterprise Plan */}
          <div className="lp-card" style={{ textAlign: 'center' }}>
            <div className="lp-tag" style={{ background: 'var(--purple-l)', color: 'var(--purple)' }}>Enterprise</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>$99<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', textAlign: 'left', display: 'inline-block', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ Dedicated Infrastructure</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ 24/7 Phone Support</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ Custom Integrations</li>
              <li style={{ marginBottom: '0.5rem' }}>✅ SLA Guarantee</li>
            </ul>
            <button className="lp-btn-secondary" style={{ width: '100%' }}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="lp-cta">
        <h2 className="lp-cta-title">Ready to secure your revenue?</h2>
        <p className="lp-cta-desc">Join thousands of businesses that trust PayReconcile to handle their financial infrastructure.</p>
        <button className="lp-btn-cta" onClick={() => navigate("/register")}>
          Create Your Account Now
        </button>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-logo" style={{ fontSize: '1.2rem', color: 'var(--text)' }}>
          <ShieldCheck size={20} className="text-blue-600" /> PayReconcile
        </div>
        <div className="lp-footer-copy">
          © {new Date().getFullYear()} PayReconcile Systems Inc. All rights reserved.
        </div>
        <div className="lp-nav-links" style={{ gap: '1.5rem' }}>
          <a href="#" className="lp-nav-link" style={{ fontSize: '0.8rem' }}>Terms</a>
          <a href="#" className="lp-nav-link" style={{ fontSize: '0.8rem' }}>Privacy</a>
          <a href="#" className="lp-nav-link" style={{ fontSize: '0.8rem' }}>Security</a>
        </div>
      </footer>
    </div>
  );
}
