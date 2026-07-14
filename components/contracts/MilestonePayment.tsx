"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { apiFetch } from "@/lib/api";
import { ShieldCheck, Loader2 } from "lucide-react";

interface MilestonePaymentProps {
  milestoneId: string;
  milestoneTitle: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

export default function MilestonePayment({ milestoneId, milestoneTitle, amount, onPaymentSuccess }: MilestonePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // Reemplazar con el Client ID de PayPal Sandbox
  const initialOptions = {
    clientId: "test", // Usa "test" para ambiente dev simulado o pon tu ClientID de Sandbox de PayPal
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async () => {
    try {
      const response = await apiFetch("/payments/paypal/create-order", {
        method: "POST",
        body: JSON.stringify({ milestoneId, amount }),
      });
      return response.id; // El ID de la orden generada por PayPal
    } catch (err: any) {
      setError("Error al crear la orden de pago: " + err.message);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    setIsProcessing(true);
    try {
      const response = await apiFetch("/payments/paypal/capture-order", {
        method: "POST",
        body: JSON.stringify({ orderId: data.orderID, milestoneId }),
      });
      
      if (response.status === "COMPLETED") {
        setIsPaid(true);
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        setError("El pago no pudo completarse o fue rechazado.");
      }
    } catch (err: any) {
      setError("Error al procesar el pago: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="text-brand-teal" size={24} />
        <h3 className="font-extrabold text-lg text-slate-800">Fondeo de Hito (Escrow)</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-slate-600 text-sm mb-1">Hito a fondear:</p>
        <p className="font-bold text-slate-800">{milestoneTitle}</p>
        <div className="mt-2 text-2xl font-black text-brand-purple">
          ${amount.toFixed(2)} USD
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      {isPaid ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold border border-green-200 text-center">
          ¡Pago completado exitosamente! Los fondos están asegurados en garantía.
        </div>
      ) : (
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center gap-2 text-brand-purple font-bold">
                <Loader2 className="animate-spin" size={24} />
                Procesando pago...
              </div>
            </div>
          )}
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              style={{ layout: "vertical", shape: "pill" }}
            />
          </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
}
