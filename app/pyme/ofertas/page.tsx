"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Eye, Trash2, Briefcase, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

interface MyOffer {
  id: string;
  title: string;
  description: string;
  budgetType: "FIJO" | "POR_HORA" | string;
  totalBudget: number;
  status: string;
  requiredSkills: string[];
  estimatedDays?: number;
  modality?: string;
  projectCategory?: string;
  publishedAt?: string;
}

function formatBudget(offer: MyOffer) {
  const amount = new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(offer.totalBudget);
  return offer.budgetType === "POR_HORA" ? `${amount} / hora` : `${amount} (fijo)`;
}

export default function MisOfertasPage() {
  const [offers, setOffers] = useState<MyOffer[] | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/offers/pyme")
      .then((data) => setOffers(data))
      .catch((err: ApiError) => setError(err.message));
  }, []);

  const handleDelete = async (offerId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta oferta?")) return;
    setDeleting(offerId);
    try {
      await apiFetch(`/offers/${offerId}`, { method: "DELETE" });
      setOffers((prev) => prev?.filter((o) => o.id !== offerId) ?? null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "No se pudo eliminar la oferta.");
    } finally {
      setDeleting(null);
    }
  };

  const stats = {
    total: offers?.length ?? 0,
    active: offers?.filter((o) => o.status === "ABIERTA" || o.status === "EN_PROCESO").length ?? 0,
    closed: offers?.filter((o) => o.status === "COMPLETADA" || o.status === "CANCELADA").length ?? 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-brand-dark">Mis ofertas</h1>
          <p className="text-sm text-slate-500">
            Administra las ofertas de proyectos que has publicado.
          </p>
        </div>
        <Link href="/ofertas/nueva">
          <Button className="rounded-2xl h-11 px-5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold">
            <Plus className="h-4 w-4" /> Nueva oferta
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light-purple text-brand-purple">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-dark">{stats.total}</p>
              <p className="text-xs font-semibold text-slate-500">Totales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light-teal text-brand-teal">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-dark">{stats.active}</p>
              <p className="text-xs font-semibold text-slate-500">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-dark">{stats.closed}</p>
              <p className="text-xs font-semibold text-slate-500">Cerradas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {offers === null ? (
        <p className="text-sm text-slate-400">Cargando ofertas...</p>
      ) : offers.length === 0 ? (
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Briefcase className="h-12 w-12 text-slate-300" />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-400">Aún no has publicado ofertas</p>
              <p className="text-sm text-slate-400">Crea tu primera oferta para recibir propuestas de freelancers.</p>
            </div>
            <Link href="/ofertas/nueva">
              <Button className="rounded-2xl h-11 px-5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold">
                <Plus className="h-4 w-4" /> Crear primera oferta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="rounded-3xl border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-brand-dark truncate">{offer.title}</h3>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-bold shrink-0 ${
                          offer.status === "ABIERTA" || offer.status === "EN_PROCESO"
                            ? "bg-brand-light-teal text-brand-teal"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2">{offer.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {offer.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatBudget(offer)}
                      </span>
                      {offer.estimatedDays && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> {offer.estimatedDays} días
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/freelancer/ofertas/${offer.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-brand-light-teal hover:text-brand-teal transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/ofertas/${offer.id}/editar`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-brand-light-purple hover:text-brand-purple transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(offer.id)}
                      disabled={deleting === offer.id}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
