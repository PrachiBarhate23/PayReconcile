import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import api from "../api/api";

interface Props {
  orderId: string;
  onSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1a1a2e",
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#a0aec0",
      },
      iconColor: "#6366f1",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

export default function StripePaymentForm({ orderId, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // 1️⃣ Create PaymentIntent
      const res = await api.post(`/payments/create-intent/${orderId}`);
      const clientSecret = res.data.clientSecret;

      // 2️⃣ Confirm using CardElement
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        alert("Payment Failed ❌");
      } else {
        alert("Payment Successful ✅");
        onSuccess();
      }

    } catch (err) {
      console.error(err);
      alert("Payment error");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Card element with styled container */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "12px",
          border: "1.5px solid #e2e8f0",
          background: "#fff",
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.07)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {/* Pay button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          background: loading
            ? "#d1d5db"
            : "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
          color: "#fff",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: loading ? "none" : "0 4px 14px 0 rgba(16, 185, 129, 0.35)",
          transition: "all 0.2s ease",
        }}
      >
        {loading ? (
          <>
            <svg
              style={{ animation: "spin 1s linear infinite", width: 18, height: 18 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" d="M12 2a10 10 0 1 0 10 10" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay Now
          </>
        )}
      </button>
    </div>
  );
}
