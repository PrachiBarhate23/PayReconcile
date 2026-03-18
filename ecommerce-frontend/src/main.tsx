import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </AuthProvider>
  </BrowserRouter>
);

