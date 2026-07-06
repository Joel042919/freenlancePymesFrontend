"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Nota: Para usar el SDK oficial de PayPal en React, deberás ejecutar:
// pnpm install @paypal/react-paypal-js
// Luego descomentar el código a continuación y envolver este componente (o tu layout) en <PayPalScriptProvider>

/*
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
*/

export default function FundMilestonePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params depending on Next.js version if necessary, here we assume it's directly available or await it.
  const milestoneId = params.id;

  // ESTA ES UNA FUNCIÓN MOCK DE PRUEBA:
  // En un flujo real, la librería de PayPal te da el 'orderId' en su callback onApprove.
  const handleMockPayment = async () => {
    try {
      // AQUÍ DEBE IR EL ORDER_ID REAL DEVUELTO POR PAYPAL
      const dummyOrderId = "PAYPAL_ORDER_ID_SIMULADO"; 
      const token = localStorage.getItem("jwt_token");
      
      const res = await fetch(`http://localhost:8080/api/v1/marketplace/milestones/${milestoneId}/fund?orderId=${dummyOrderId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/pyme/dashboard");
        }, 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al fondear el hito");
      }
    } catch (err: any) {
      setError(err.message || "Error de red");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Fondeo de Hito (Escrow)</h1>
      <p className="text-slate-600 mb-8 text-center">
        Estás a punto de depositar los fondos en garantía para el hito seleccionado. 
        Este dinero quedará retenido de forma segura hasta que apruebes la entrega del freelancer.
      </p>

      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center font-medium">
          ¡Fondeo exitoso! El hito ha sido marcado como financiado. Redirigiendo...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-brand-light-teal p-6 rounded-lg border border-teal-100">
            <h2 className="text-xl font-bold text-brand-teal mb-2">Resumen de Pago</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-700">Monto del Hito:</span>
              <span className="font-semibold text-lg">$100.00 USD</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Tarifa de Escrow (Plataforma):</span>
              <span>$0.00 USD</span>
            </div>
            <div className="border-t border-teal-200 my-4"></div>
            <div className="flex justify-between items-center font-bold text-xl text-slate-800">
              <span>Total a pagar:</span>
              <span>$100.00 USD</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* MOCK BUTTON: */}
          <button 
            onClick={handleMockPayment}
            className="w-full bg-[#ffc439] hover:bg-[#f4bb33] text-[#003087] font-bold py-4 px-6 rounded-full shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <svg viewBox="0 0 100 32" className="h-6" fill="currentColor">
               <path fill="#003087" d="M12.9 8.2c-.2-.6-.7-.9-1.3-.9H3.9c-.8 0-1.5.5-1.7 1.3L.1 23.4c-.1.5.3 1 .8 1h3.7c.8 0 1.5-.5 1.7-1.3l.8-4.9c.1-.8.9-1.4 1.7-1.4h1.7c4 0 7.3-1.6 8.3-6.1.5-2.2.1-4.1-1.3-5.3-1-1-2.7-1.5-4.6-1.5z"></path>
               <path fill="#0079C1" d="M37.3 8.2c-.2-.6-.7-.9-1.3-.9h-7.6c-.8 0-1.5.5-1.7 1.3l-2.1 14.8c-.1.5.3 1 .8 1h3.6c.8 0 1.5-.5 1.7-1.3l.7-4.9c.1-.8.9-1.4 1.7-1.4h1.7c4 0 7.3-1.6 8.3-6.1.4-1.9.1-3.6-1.1-4.8-1-1-2.6-1.5-4.7-1.5z"></path>
            </svg>
            Pagar con PayPal (Simulación)
          </button>

          {/* EJEMPLO DE IMPLEMENTACIÓN REAL (comentado): 
          <PayPalButtons 
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{ amount: { value: "100.00" } }]
              });
            }}
            onApprove={(data, actions) => {
              // Llamas al backend pasándole data.orderID
              return handleRealPayment(data.orderID);
            }}
          />
          */}
          
        </div>
      )}
    </div>
  );
}
