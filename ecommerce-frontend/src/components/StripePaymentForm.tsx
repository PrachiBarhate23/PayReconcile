import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import api from "../api/api";

interface Props {
  orderId: string;
  onSuccess: () => void;
}

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
      <CardElement className="border p-3 rounded" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
