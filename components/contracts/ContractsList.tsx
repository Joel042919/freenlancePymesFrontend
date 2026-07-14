"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileSignature, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";

interface Contract {
  id: string;
  offerTitle: string;
  freelancerName: string;
  pymeCompanyName: string;
  status: "DRAFT" | "SIGNED" | "COMPLETED" | string;
  signedByFreelancer: boolean;
  signedByPyme: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Pendiente de firma",
  SIGNED: "Firmado",
  COMPLETED: "Completado",
};

interface ContractsListProps {
  basePath: "/freelancer/contratos" | "/pyme/contratos";
}

export default function ContractsList({ basePath }: ContractsListProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/contracts/my")
      .then((data) => setContracts(data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-dark">Mis contratos</h1>
        <p className="text-lg text-slate-500">
          Revisa el estado de tus contratos digitales y firma los que estén pendientes.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando contratos...</p>
      ) : contracts.length === 0 ? (
        <p className="text-sm text-slate-400">Aún no tienes contratos.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {contracts.map((contract) => (
            <Link key={contract.id} href={`${basePath}/${contract.id}`}>
              <Card className="h-full bg-white rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light-purple text-brand-purple">
                      <FileSignature className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {STATUS_LABEL[contract.status] || contract.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-brand-dark">{contract.offerTitle}</h3>
                  <p className="text-xs text-slate-400">
                    {contract.freelancerName} · {contract.pymeCompanyName}
                  </p>
                  <div className="mt-auto flex items-center gap-1 text-sm font-bold text-brand-purple">
                    Ver detalle <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
