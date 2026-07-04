"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

interface ReceivedApplication {
  id: string;
  offerId: string;
  offerTitle: string;
  freelancerName: string;
  proposedAmount: number;
  estimatedDays: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | string;
}

interface MilestoneRow {
  title: string;
  amount: string;
  deadline: string;
}

function emptyRow(): MilestoneRow {
  return { title: "", amount: "", deadline: "" };
}

export default function AplicacionesRecibidasPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ReceivedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openFormFor, setOpenFormFor] = useState<string | null>(null);
  const [rows, setRows] = useState<MilestoneRow[]>([emptyRow()]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch("/marketplace/applications/received")
      .then((data) => setApplications(data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startAccepting = (applicationId: string) => {
    setOpenFormFor(applicationId);
    setRows([emptyRow()]);
    setFormError("");
  };

  const updateRow = (index: number, field: keyof MilestoneRow, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleAccept = async (applicationId: string) => {
    setFormError("");

    const milestones = rows.map((row) => ({
      title: row.title.trim(),
      amount: Number(row.amount),
      deadline: row.deadline,
    }));

    if (milestones.some((m) => !m.title || !m.amount || m.amount <= 0 || !m.deadline)) {
      setFormError("Completa título, monto (> 0) y fecha límite para cada hito.");
      return;
    }

    setSubmitting(true);
    try {
      const contract = await apiFetch(`/marketplace/applications/${applicationId}/accept`, {
        method: "POST",
        body: JSON.stringify({ milestones }),
      });
      router.push(`/pyme/contratos/${contract.id}`);
    } catch (err: any) {
      setFormError(err.message || "No se pudo aceptar la postulación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-brand-dark">Postulaciones recibidas</h1>
        <p className="text-sm text-slate-500">
          Revisa las propuestas de los freelancers y acepta la que más te convenga definiendo los hitos del contrato.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando postulaciones...</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-slate-400">Aún no has recibido postulaciones.</p>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => (
            <Card key={app.id} className="rounded-3xl border-slate-100 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light-purple text-brand-purple">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">{app.offerTitle}</h3>
                      <p className="text-sm text-slate-500">
                        {app.freelancerName} · Propone{" "}
                        {new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(
                          app.proposedAmount
                        )}{" "}
                        en {app.estimatedDays} días
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {app.status}
                  </span>
                </div>

                {app.status === "PENDING" && (
                  <>
                    {openFormFor === app.id ? (
                      <div className="space-y-3 rounded-2xl bg-slate-50 p-5">
                        {formError && (
                          <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                            {formError}
                          </div>
                        )}
                        {rows.map((row, index) => (
                          <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] items-end">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Título del hito</Label>
                              <Input
                                value={row.title}
                                onChange={(e) => updateRow(index, "title", e.target.value)}
                                className="rounded-xl h-10 bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Monto (USD)</Label>
                              <Input
                                type="number"
                                min={1}
                                value={row.amount}
                                onChange={(e) => updateRow(index, "amount", e.target.value)}
                                className="rounded-xl h-10 bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Fecha límite</Label>
                              <Input
                                type="date"
                                value={row.deadline}
                                onChange={(e) => updateRow(index, "deadline", e.target.value)}
                                className="rounded-xl h-10 bg-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              disabled={rows.length === 1}
                              className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addRow}
                          className="flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:underline"
                        >
                          <Plus className="h-4 w-4" /> Agregar hito
                        </button>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenFormFor(null)}
                            className="rounded-2xl h-10 px-4"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleAccept(app.id)}
                            className="rounded-2xl h-10 px-6 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold"
                          >
                            {submitting ? "Creando contrato..." : "Confirmar y crear contrato"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => startAccepting(app.id)}
                        className="rounded-2xl h-10 px-5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold"
                      >
                        Aceptar y crear contrato
                      </Button>
                    )}
                  </>
                )}

                {app.status === "ACCEPTED" && (
                  <div className="flex items-center gap-2 text-sm font-bold text-brand-teal">
                    <CheckCircle2 className="h-4 w-4" /> Postulación aceptada
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
