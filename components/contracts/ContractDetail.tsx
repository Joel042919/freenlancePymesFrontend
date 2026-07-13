"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock, DollarSign, FileText,
  Upload, ThumbsUp, ThumbsDown, Loader2, ExternalLink, AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { getRole } from "@/lib/auth";
import SignaturePad from "./SignaturePad";

interface Milestone {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  status: string;
  evidenceUrl?: string | null;
  evidenceNotes?: string | null;
  evidenceSubmittedAt?: string | null;
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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING_FUNDING: { label: "Pendiente de fondeo", color: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
  FUNDED: { label: "Fondeado", color: "bg-blue-50 text-blue-700 ring-blue-200", icon: DollarSign },
  DELIVERED: { label: "Entregado", color: "bg-purple-50 text-purple-700 ring-purple-200", icon: Upload },
  APPROVED: { label: "Aprobado", color: "bg-green-50 text-green-700 ring-green-200", icon: ThumbsUp },
  REJECTED: { label: "Rechazado", color: "bg-red-50 text-red-700 ring-red-200", icon: ThumbsDown },
  DISPUTED: { label: "En disputa", color: "bg-orange-50 text-orange-700 ring-orange-200", icon: AlertTriangle },
  PAID: { label: "Pagado", color: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: CheckCircle2 },
};

export default function ContractDetail({ contractId, backHref }: ContractDetailProps) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [deliverEvidenceUrl, setDeliverEvidenceUrl] = useState("");
  const [deliverNotes, setDeliverNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la firma.");
    } finally {
      setSigning(false);
    }
  };

  const handleMilestoneAction = async (milestoneId: string, action: string, body?: Record<string, unknown>) => {
    setActionLoading(milestoneId + action);
    setActionError("");
    setActionSuccess("");
    try {
      await apiFetch(`/marketplace/milestones/${milestoneId}/${action}`, {
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      setActionSuccess(`Hito ${action === "fund" ? "fondeado" : action === "deliver" ? "entregado" : action === "approve" ? "aprobado" : "rechazado"} correctamente.`);
      setTimeout(() => setActionSuccess(""), 3000);
      load();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al ejecutar la acción.");
    } finally {
      setActionLoading(null);
      setDeliveringId(null);
      setDeliverEvidenceUrl("");
      setDeliverNotes("");
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

      {actionError && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-600 border border-green-100">
          {actionSuccess}
        </div>
      )}

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
                  {contract.milestones.map((milestone) => {
                    const config = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.PENDING_FUNDING;
                    const StatusIcon = config.icon;
                    const isLoading = actionLoading === milestone.id + "fund" ||
                      actionLoading === milestone.id + "deliver" ||
                      actionLoading === milestone.id + "approve" ||
                      actionLoading === milestone.id + "reject";

                    return (
                      <div key={milestone.id} className="rounded-2xl bg-slate-50 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="font-bold text-brand-dark">{milestone.title}</p>
                            <p className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3.5 w-3.5" /> Fecha límite: {milestone.deadline}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-sm font-bold text-brand-dark">
                              <DollarSign className="h-4 w-4 text-brand-teal" />
                              {new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(milestone.amount)}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {config.label}
                            </span>
                          </div>
                        </div>

                        {milestone.evidenceUrl && (
                          <div className="rounded-xl bg-white p-3 space-y-1 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500">Evidencia entregada:</p>
                            <a
                              href={milestone.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm font-semibold text-brand-teal hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Ver evidencia
                            </a>
                            {milestone.evidenceNotes && (
                              <p className="text-xs text-slate-500 mt-1">Notas: {milestone.evidenceNotes}</p>
                            )}
                            {milestone.evidenceSubmittedAt && (
                              <p className="text-xs text-slate-400">
                                Entregado: {new Date(milestone.evidenceSubmittedAt).toLocaleDateString("es")}
                              </p>
                            )}
                          </div>
                        )}

                        {role === "PYME" && milestone.status === "PENDING_FUNDING" && bothSigned && (
                          <Button
                            onClick={() => handleMilestoneAction(milestone.id, "fund")}
                            disabled={isLoading}
                            className="w-full rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold h-10"
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                            Fondear hito
                          </Button>
                        )}

                        {role === "FREELANCER" && milestone.status === "FUNDED" && (
                          <div className="space-y-2">
                            {deliveringId === milestone.id ? (
                              <div className="space-y-2 rounded-xl bg-white p-3 border border-slate-200">
                                <Input
                                  value={deliverEvidenceUrl}
                                  onChange={(e) => setDeliverEvidenceUrl(e.target.value)}
                                  placeholder="URL de la evidencia (GitHub, Drive, etc.)"
                                  className="rounded-xl border-slate-200 h-10"
                                />
                                <textarea
                                  value={deliverNotes}
                                  onChange={(e) => setDeliverNotes(e.target.value)}
                                  placeholder="Notas adicionales (opcional)"
                                  rows={2}
                                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleMilestoneAction(milestone.id, "deliver", {
                                      evidenceUrl: deliverEvidenceUrl,
                                      notes: deliverNotes,
                                    })}
                                    disabled={!deliverEvidenceUrl.trim() || isLoading}
                                    className="flex-1 rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold h-10"
                                  >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Entregar
                                  </Button>
                                  <Button
                                    onClick={() => { setDeliveringId(null); setDeliverEvidenceUrl(""); setDeliverNotes(""); }}
                                    variant="outline"
                                    className="rounded-xl h-10"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setDeliveringId(milestone.id)}
                                className="w-full rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold h-10"
                              >
                                <Upload className="h-4 w-4" /> Subir evidencia y marcar como entregado
                              </Button>
                            )}
                          </div>
                        )}

                        {role === "FREELANCER" && milestone.status === "REJECTED" && (
                          <div className="space-y-2">
                            <p className="text-xs text-red-600 font-semibold">La PYME rechazó esta entrega. Puedes re-entregar.</p>
                            {deliveringId === milestone.id ? (
                              <div className="space-y-2 rounded-xl bg-white p-3 border border-slate-200">
                                <Input
                                  value={deliverEvidenceUrl}
                                  onChange={(e) => setDeliverEvidenceUrl(e.target.value)}
                                  placeholder="URL de la evidencia"
                                  className="rounded-xl border-slate-200 h-10"
                                />
                                <textarea
                                  value={deliverNotes}
                                  onChange={(e) => setDeliverNotes(e.target.value)}
                                  placeholder="Notas adicionales"
                                  rows={2}
                                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleMilestoneAction(milestone.id, "deliver", {
                                      evidenceUrl: deliverEvidenceUrl,
                                      notes: deliverNotes,
                                    })}
                                    disabled={!deliverEvidenceUrl.trim() || isLoading}
                                    className="flex-1 rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold h-10"
                                  >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Re-entregar
                                  </Button>
                                  <Button
                                    onClick={() => { setDeliveringId(null); setDeliverEvidenceUrl(""); setDeliverNotes(""); }}
                                    variant="outline"
                                    className="rounded-xl h-10"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setDeliveringId(milestone.id)}
                                className="w-full rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold h-10"
                              >
                                <Upload className="h-4 w-4" /> Re-entregar evidencia
                              </Button>
                            )}
                          </div>
                        )}

                        {role === "PYME" && milestone.status === "DELIVERED" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleMilestoneAction(milestone.id, "approve")}
                              disabled={isLoading}
                              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold h-10"
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                              Aprobar y liberar pago
                            </Button>
                            <Button
                              onClick={() => handleMilestoneAction(milestone.id, "reject")}
                              disabled={isLoading}
                              variant="outline"
                              className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold h-10"
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                              Rechazar
                            </Button>
                          </div>
                        )}

                        {milestone.status === "APPROVED" && (
                          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Hito aprobado — Pago liberado al freelancer
                          </div>
                        )}

                        {milestone.status === "PAID" && (
                          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Hito pagado
                          </div>
                        )}
                      </div>
                    );
                  })}
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
