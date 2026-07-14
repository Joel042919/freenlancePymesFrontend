"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Clock, ShieldCheck, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api";

interface Offer {
  id: string;
  title: string;
  description: string;
  budgetType: "FIXED" | "HOURLY" | string;
  totalBudget: number;
  status: string;
  pymeCompanyName: string;
  pymeVerified: boolean;
  requiredSkills: string[];
}

function formatBudget(offer: Offer) {
  const amount = new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(offer.totalBudget);
  return offer.budgetType === "HOURLY" ? `${amount} / hora` : `${amount} (fijo)`;
}

export default function OfertasPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  useEffect(() => {
    apiFetch("/marketplace/offers")
      .then((data) => setOffers(data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredOffers = useMemo(() => {
    if (!skillFilter.trim()) return offers;
    const term = skillFilter.trim().toLowerCase();
    return offers.filter((offer) =>
      offer.requiredSkills.some((skill) => skill.toLowerCase().includes(term))
    );
  }, [offers, skillFilter]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-brand-dark">Ofertas de proyectos</h1>
        <p className="text-lg text-slate-500">
          Explora las oportunidades publicadas por las PYMEs y postula con tu propuesta.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Filtrar por habilidad (ej. React)"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="pl-12 rounded-2xl border-slate-200 bg-white h-11"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando ofertas...</p>
      ) : filteredOffers.length === 0 ? (
        <p className="text-sm text-slate-400">No hay ofertas disponibles por el momento.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredOffers.map((offer) => (
            <Link key={offer.id} href={`/freelancer/ofertas/${offer.id}`}>
              <Card className="h-full bg-white rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light-teal text-brand-teal">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-brand-light-teal px-3 py-1 text-xs font-bold text-brand-teal">
                      {offer.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-brand-dark leading-snug">{offer.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{offer.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span>{offer.pymeCompanyName}</span>
                    {offer.pymeVerified && (
                      <span className="flex items-center gap-1 text-brand-purple">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verificada
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {offer.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-bold text-brand-dark">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {formatBudget(offer)}
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
