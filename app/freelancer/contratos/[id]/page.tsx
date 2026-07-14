"use client";

import React from "react";
import MilestonePayment from "@/components/contracts/MilestonePayment";
import { useParams } from "next/navigation";
import { FileText, CheckCircle2 } from "lucide-react";

export default function ContratoDetallePage() {
  const params = useParams();
  const contractId = params.id as string;

  // Mock de datos del contrato
  const contract = {
    id: contractId,
    title: "Desarrollo de MVP E-commerce",
    freelancer: "John Doe (Backend Developer)",
    pyme: "Acme Software",
    status: "FIRMADO",
    milestones: [
      { id: "m1", title: "Configuración inicial y BD", amount: 250.0, status: "PENDING_FUNDING" },
      { id: "m2", title: "API y Módulos Core", amount: 500.0, status: "DRAFT" }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FileText className="text-brand-purple" size={32} />
            {contract.title}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Contrato #{contract.id.substring(0,8)}... · {contract.freelancer}</p>
        </div>
        <div className="bg-brand-light-purple text-brand-purple px-4 py-2 rounded-full font-bold text-sm border border-brand-purple/20">
          Estado: {contract.status}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Hitos del Proyecto (Milestones)</h2>
        
        <div className="space-y-6">
          {contract.milestones.map((m, idx) => (
            <div key={m.id} className="flex gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-slate-200 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{m.title}</h3>
                </div>
                <p className="text-slate-500 text-sm">El freelancer no empezará a trabajar hasta que este hito esté fondeado.</p>
              </div>

              <div className="w-80">
                {m.status === "PENDING_FUNDING" ? (
                  <MilestonePayment 
                    milestoneId={m.id}
                    milestoneTitle={m.title}
                    amount={m.amount}
                  />
                ) : (
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2 h-full">
                    Bloqueado hasta completar anterior
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
