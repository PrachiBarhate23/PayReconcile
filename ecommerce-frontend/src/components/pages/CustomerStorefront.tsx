import React, { useEffect, useState, useCallback } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../context/AuthContext";
import { getProducts } from "../../api/products";
import api from "../../api/api";
import StripePaymentForm from "../StripePaymentForm";

const stripePromise = loadStripe("pk_test_51SyUr30XUn5ie1q7w4ERPoSHadGsEAKPyJBHRZJaNvcafD9O3S5xr6T4hvzIb9ew1IKg5WW9VmCACp9yRye5wBkG00kEetFGJV");

interface Product { id: string; name: string; description: string; price: number; originalPrice: number; category: string; brand: string; imageUrl: string; rating: number; reviewCount: number; inStock: boolean; badge?: string; }
interface CartItem { product: Product; qty: number; }

const S = {
  root: { fontFamily: "'Inter',sans-serif", minHeight: "100vh", background: "#f3f4f6" } as React.CSSProperties,
  nav: { background: "#131921", padding: "0 24px", display: "flex", alignItems: "center", gap: 20, height: 60, position: "sticky" as const, top: 0, zIndex: 100 },
  logo: { color: "#ff9900", fontWeight: 900, fontSize: 22, letterSpacing: -1, whiteSpace: "nowrap" as const },
  searchBar: { flex: 1, display: "flex", borderRadius: 4, overflow: "hidden", maxWidth: 700 },
  searchInput: { flex: 1, padding: "10px 16px", border: "none", fontSize: 14, outline: "none" },
  searchBtn: { background: "#ff9900", border: "none", padding: "0 16px", cursor: "pointer", display: "flex", alignItems: "center" },
  cartBtn: { background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, position: "relative" as const },
  badge: { background: "#ff9900", color: "#131921", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, position: "absolute" as const, top: -8, right: -8 },
  banner: { background: "linear-gradient(135deg,#232f3e 0%,#37475a 100%)", color: "#fff", textAlign: "center" as const, padding: "48px 24px" },
  bannerTitle: { fontSize: 40, fontWeight: 800, margin: "0 0 12px", letterSpacing: -1 },
  bannerSub: { fontSize: 18, color: "#ff9900", margin: 0 },
  catBar: { background: "#232f3e", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" as const },
  catBtn: (active: boolean): React.CSSProperties => ({ background: active ? "#ff9900" : "transparent", color: active ? "#131921" : "#ddd", border: "none", padding: "10px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, borderRadius: "0 0 4px 4px", whiteSpace: "nowrap" }),
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16, padding: "24px", maxWidth: 1400, margin: "0 auto" },
  card: { background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.1)", transition: "box-shadow .2s", cursor: "pointer" } as React.CSSProperties,
  img: { width: "100%", height: 200, objectFit: "contain" as const, padding: 16, background: "#fff" },
  cardBody: { padding: "12px 16px 16px" },
  cardName: { fontSize: 14, fontWeight: 600, color: "#0f1111", marginBottom: 4, lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" } as React.CSSProperties,
  price: { fontSize: 20, fontWeight: 800, color: "#b12704" },
  original: { fontSize: 12, color: "#888", textDecoration: "line-through", marginLeft: 8 },
  addBtn: { width: "100%", marginTop: 12, padding: "9px 0", background: "#ff9900", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#131921", transition: "background .15s" },
  modal: { position: "fixed" as const, inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  backdrop: { position: "absolute" as const, inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" } as React.CSSProperties,
  drawer: { position: "fixed" as const, top: 0, right: 0, bottom: 0, width: 400, background: "#fff", zIndex: 201, display: "flex", flexDirection: "column" as const, boxShadow: "-4px 0 24px rgba(0,0,0,.2)", overflowY: "auto" as const },
  drawerHead: { background: "#131921", color: "#fff", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  stars: (r: number) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r)),
};

const CATEGORIES = ["All", "Electronics", "Smartphones", "Computers", "Fashion", "Footwear", "Kitchen", "Home", "Furniture"];

export function CustomerStorefront() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"closed"|"address"|"payment">("closed");
  const [address, setAddress] = useState({ name: "", street: "", city: "", pin: "", phone: "" });
  const [orderId, setOrderId] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = products.filter(p =>
    (category === "All" || p.category === category) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = useCallback((p: Product) => {
    setCart(c => { const ex = c.find(i => i.product.id === p.id); return ex ? c.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { product: p, qty: 1 }]; });
  }, []);

  const removeFromCart = (id: string) => setCart(c => c.filter(i => i.product.id !== id));
  const updateQty = (id: string, qty: number) => { if (qty < 1) { removeFromCart(id); return; } setCart(c => c.map(i => i.product.id === id ? { ...i, qty } : i)); };
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handlePlaceOrder = async () => {
    if (!address.name || !address.street || !address.city) { alert("Please fill all address fields"); return; }
    try {
      const res = await api.post("/orders", { username: user?.username, quantity: cartCount, amount: total, productName: cart.map(i => i.product.name).join(", ") });
      setOrderId(res.data.id);
      setCheckoutStep("payment");
    } catch { alert("Could not create order. Please try again."); }
  };

  const handlePaySuccess = () => { setPaySuccess(true); setCart([]); setCheckoutStep("closed"); };

  return (
    <div style={S.root}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo}>🛒 ShopReconcile</div>
        <div style={S.searchBar}>
          <input style={S.searchInput} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.searchBtn}><svg width="18" height="18" fill="none" stroke="#131921" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2.5"/></svg></button>
        </div>
        <div style={{ color: "#ccc", fontSize: 13 }}>👤 {user?.username}</div>
        <button style={S.cartBtn} onClick={() => setCartOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 7h12.8M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
          Cart {cartCount > 0 && <span style={S.badge}>{cartCount}</span>}
        </button>
      </nav>

      {/* Category bar */}
      <div style={S.catBar}>
        {CATEGORIES.map(c => <button key={c} style={S.catBtn(category === c)} onClick={() => setCategory(c)}>{c}</button>)}
      </div>

      {/* Banner */}
      {category === "All" && !search && (
        <div style={S.banner}>
          <h1 style={S.bannerTitle}>Shop Everything, Pay Smart</h1>
          <p style={S.bannerSub}>Every payment automatically reconciled — powered by PayReconcile</p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["Free Delivery on ₹499+", "Stripe Secured Payments", "Auto Refund on Issues"].map(t => (
              <span key={t} style={{ background: "rgba(255,153,0,.15)", border: "1px solid #ff9900", color: "#ff9900", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Success toast */}
      {paySuccess && (
        <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: 8, padding: "16px 24px", margin: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div><strong>Order placed successfully!</strong><br /><span style={{ fontSize: 13, color: "#155724" }}>Your payment was processed and the order is reflected in the admin dashboard.</span></div>
          <button onClick={() => setPaySuccess(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <div style={{ width: 48, height: 48, border: "4px solid #ff9900", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#666" }}>Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "#666" }}>No products found.</div>
      ) : (
        <div style={S.grid}>
          {filtered.map(p => (
            <div key={p.id} style={S.card}>
              {p.badge && <div style={{ position: "absolute", top: 12, left: 12, background: p.badge === "Deal" ? "#c0392b" : p.badge === "Best Seller" ? "#ff9900" : "#2ecc71", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 3, textTransform: "uppercase", zIndex: 1, letterSpacing: 0.5 }}>{p.badge}</div>}
              <div style={{ position: "relative" }}>
                <img src={p.imageUrl} alt={p.name} style={S.img} onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/300x200/f3f4f6/666?text=${encodeURIComponent(p.name.split(" ")[0])}`; }} />
              </div>
              <div style={S.cardBody}>
                <div style={{ fontSize: 11, color: "#007185", marginBottom: 4, fontWeight: 600 }}>{p.brand} · {p.category}</div>
                <div style={S.cardName}>{p.name}</div>
                <div style={{ color: "#ff9900", fontSize: 13, marginTop: 4 }}>{S.stars(p.rating)} <span style={{ color: "#888", fontSize: 11 }}>({p.reviewCount.toLocaleString()})</span></div>
                <div style={{ marginTop: 8 }}>
                  <span style={S.price}>₹{p.price.toLocaleString("en-IN")}</span>
                  {p.originalPrice > p.price && <span style={S.original}>₹{p.originalPrice.toLocaleString("en-IN")}</span>}
                </div>
                {p.originalPrice > p.price && <div style={{ color: "#c0392b", fontSize: 12, fontWeight: 700, marginTop: 2 }}>{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% off</div>}
                <div style={{ fontSize: 12, color: p.inStock ? "#007600" : "#c0392b", marginTop: 4, fontWeight: 600 }}>{p.inStock ? "✓ In Stock" : "Out of Stock"}</div>
                <button style={S.addBtn} disabled={!p.inStock} onClick={() => addToCart(p)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200 }} onClick={() => setCartOpen(false)} />
          <div style={S.drawer}>
            <div style={S.drawerHead}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>🛒 Your Cart ({cartCount})</span>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            {cart.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 16 }}>Your cart is empty</div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: "flex", gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #eee" }}>
                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 6, background: "#f9f9f9", border: "1px solid #eee" }} onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/72x72/f3f4f6/666?text=IMG`; }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f1111", lineHeight: 1.4 }}>{item.product.name}</div>
                        <div style={{ color: "#b12704", fontWeight: 800, marginTop: 4 }}>₹{item.product.price.toLocaleString("en-IN")}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                          <button onClick={() => updateQty(item.product.id, item.qty - 1)} style={{ width: 26, height: 26, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", background: "#f0f0f0" }}>-</button>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.product.id, item.qty + 1)} style={{ width: 26, height: 26, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", background: "#f0f0f0" }}>+</button>
                          <button onClick={() => removeFromCart(item.product.id)} style={{ marginLeft: 8, color: "#c0392b", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "20px 24px", borderTop: "1px solid #eee", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                    <span style={{ fontWeight: 900, fontSize: 20, color: "#b12704" }}>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); setCheckoutStep("address"); }} style={{ width: "100%", padding: "14px", background: "#ff9900", border: "none", borderRadius: 20, fontWeight: 800, fontSize: 15, cursor: "pointer", color: "#131921" }}>Proceed to Checkout</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Address Modal */}
      {checkoutStep === "address" && (
        <div style={S.modal}>
          <div style={S.backdrop} onClick={() => setCheckoutStep("closed")} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 12, padding: 32, width: "100%", maxWidth: 480, zIndex: 1 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800 }}>📦 Delivery Address</h2>
            {[
              { key: "name", label: "Full Name", placeholder: "John Doe" },
              { key: "street", label: "Street Address", placeholder: "123 Main Street, Apt 4B" },
              { key: "city", label: "City", placeholder: "Mumbai" },
              { key: "pin", label: "PIN Code", placeholder: "400001" },
              { key: "phone", label: "Mobile Number", placeholder: "+91 9876543210" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input value={(address as any)[f.key]} onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => setCheckoutStep("closed")} style={{ flex: "0 0 33%", padding: "12px", border: "1.5px solid #ddd", borderRadius: 8, background: "#f9f9f9", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handlePlaceOrder} style={{ flex: 1, padding: "12px", background: "#ff9900", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontSize: 15 }}>Continue to Payment →</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {checkoutStep === "payment" && orderId && (
        <div style={S.modal}>
          <div style={S.backdrop} onClick={() => setCheckoutStep("closed")} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 12, padding: 32, width: "100%", maxWidth: 460, zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36 }}>💳</div>
              <h2 style={{ margin: "8px 0 4px", fontSize: 20, fontWeight: 800 }}>Secure Payment</h2>
              <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Order ID: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{orderId.slice(0, 12)}...</code></p>
              <div style={{ marginTop: 12, fontSize: 22, fontWeight: 900, color: "#b12704" }}>₹{total.toLocaleString("en-IN")}</div>
            </div>
            <div style={{ border: "1.5px solid #eee", borderRadius: 10, padding: 16, marginBottom: 16, background: "#fafafa" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Card Details</p>
              <Elements stripe={stripePromise}>
                <StripePaymentForm orderId={orderId} onSuccess={handlePaySuccess} />
              </Elements>
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: "#aaa" }}>🔒 256-bit SSL encrypted · Powered by Stripe</div>
            <button onClick={() => setCheckoutStep("closed")} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>×</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
