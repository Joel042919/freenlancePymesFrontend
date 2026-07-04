"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, DollarSign, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { getRole } from "@/lib/auth";
import SignaturePad from "./SignaturePad";

interface Milestone {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  status: string;
}

interface Contract {
  id: string;
  offerTitle: string;
  offerDescription: string;
  freelancerName: string;
  pymeCompanyName: string;
  status: "DRAFT" | "SIGNED" | "COMPLETED" | string;
  signedByFreelancer: boolean;
  signedByPyme: boolean;
  milestones: Milestone[];
}

interface ContractDetailProps {
  contractId: string;
  backHref: string;
}

export default function ContractDetail({ contractId, backHref }: ContractDetailProps) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  const role = getRole();

  const load = () => {
    setLoading(true);
    apiFetch(`/contracts/${contractId}`)
      .then((data) => setContract(data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  const handleSign = async (signatureImage: string) => {
    setSigning(true);
    setError("");
    try {
      const updated = await apiFetch(`/contracts/${contractId}/sign`, {
        method: "PATCH",
        body: JSON.stringify({ signatureImage }),
      });
      setContract(updated);
    } catch (err: any) {
      setError(err.message || "No se pudo registrar la firma.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Cargando contrato...</p>;
  if (error && !contract) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!contract) return null;

  const alreadySigned = role === "PYME" ? contract.signedByPyme : contract.signedByFreelancer;
  const bothSigned = contract.signedByFreelancer && contract.signedByPyme;

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push(backHref)}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-purple"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis contratos
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="space-y-4 p-8">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-extrabold text-brand-dark">{contract.offerTitle}</h1>
                <span className="rounded-full bg-brand-light-purple px-3 py-1 text-xs font-bold text-brand-purple">
                  {contract.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                Freelancer: {contract.freelancerName} · PYME: {contract.pymeCompanyName}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <FileText className="h-4 w-4" /> Alcance del contrato
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {contract.offerDescription}
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hitos y entregables pactados
                </div>
                <div className="space-y-3">
                  {contract.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-bold text-brand-dark">{milestone.title}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" /> Fecha límite: {milestone.deadline}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sm font-bold text-brand-dark">
                          <DollarSign className="h-4 w-4 text-brand-teal" />
                          {new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(
                            milestone.amount
                          )}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-3xl border-slate-100 shadow-sm sticky top-24">
            <CardContent className="space-y-5 p-8">
              <h2 className="text-lg font-bold text-brand-dark">Firma digital</h2>

              {error && (
                <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              {bothSigned ? (
                <div className="flex items-center gap-2 rounded-2xl bg-brand-light-teal p-4 text-sm font-bold text-brand-teal">
                  <CheckCircle2 className="h-4 w-4" />
                  Contrato firmado por ambas partes.
                </div>
              ) : alreadySigned ? (
                <div className="flex items-center gap-2 rounded-2xl bg-brand-light-purple p-4 text-sm font-bold text-brand-purple">
                  <CheckCircle2 className="h-4 w-4" />
                  Ya firmaste. Esperando la firma de la otra parte.
                </div>
              ) : (
                <SignaturePad onSign={handleSign} signing={signing} />
              )}

              <div className="space-y-1 pt-2 text-xs font-semibold text-slate-400">
                <p>Freelancer: {contract.signedByFreelancer ? "Firmado ✓" : "Pendiente"}</p>
                <p>PYME: {contract.signedByPyme ? "Firmado ✓" : "Pendiente"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
