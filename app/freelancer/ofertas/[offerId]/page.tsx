"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck, DollarSign, ListChecks, ArrowLeft, CheckCircle2,
  Calendar, Clock, MapPin, Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { SkillGapModal } from "@/components/SkillGapModal";

interface Offer {
  id: string;
  title: string;
  description: string;
  budgetType: "FIXED" | "HOURLY" | string;
  totalBudget: number;
  minBudget?: number;
  maxBudget?: number;
  status: string;
  pymeCompanyName: string;
  pymeVerified: boolean;
  requiredSkills: string[];
  duration?: string;
  modality?: "REMOTE" | "ONSITE" | "HYBRID";
  applicationDeadline?: string;
  createdAt?: string;
  pymeId?: string;
}

interface StudyModule {
  week: number;
  title: string;
  topics: string[];
}

interface StudyPlan {
  skill: string;
  title: string;
  description: string;
  duration: string;
  modules: StudyModule[];
}

interface SkillGapBody {
  error: string;
  missingSkills: string[];
  studyPlans: Record<string, StudyPlan>;
}

const MODALITY_LABELS: Record<string, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

const MODALITY_ICONS: Record<string, typeof MapPin> = {
  REMOTE: Clock,
  ONSITE: Building2,
  HYBRID: MapPin,
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "long",
  }).format(new Date(dateStr));
}

export default function OfferDetailPage() {
  const params = useParams<{ offerId: string }>();
  const router = useRouter();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [proposedAmount, setProposedAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [skillGap, setSkillGap] = useState<SkillGapBody | null>(null);
  const [showSkillGapModal, setShowSkillGapModal] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch(`/marketplace/offers/${params.offerId}`)
      .then((data) => setOffer(data))
      .catch((err: ApiError) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [params.offerId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSkillGap(null);
    setShowSkillGapModal(false);

    const amount = Number(proposedAmount);
    const days = Number(estimatedDays);

    if (!amount || amount <= 0) {
      setSubmitError("El monto propuesto debe ser mayor a 0.");
      return;
    }
    if (!days || days <= 0) {
      setSubmitError("Los días estimados deben ser mayor a 0.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/marketplace/offers/${params.offerId}/apply`, {
        method: "POST",
        body: JSON.stringify({ proposedAmount: amount, estimatedDays: days }),
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400 && err.body?.missingSkills) {
        setSkillGap(err.body as SkillGapBody);
        setShowSkillGapModal(true);
      } else {
        setSubmitError(err instanceof Error ? err.message : "No se pudo enviar la postulación.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Cargando oferta...</p>;
  if (loadError) return <p className="text-sm font-semibold text-red-600">{loadError}</p>;
  if (!offer) return null;

  const formattedBudget = new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(
    offer.totalBudget
  );

  const formattedMin = offer.minBudget
    ? new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(offer.minBudget)
    : null;
  const formattedMax = offer.maxBudget
    ? new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(offer.maxBudget)
    : null;

  const ModalityIcon = offer.modality ? MODALITY_ICONS[offer.modality] || MapPin : null;

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push("/freelancer/ofertas")}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-teal"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a ofertas
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-extrabold text-brand-dark">{offer.title}</h1>
                <span className="rounded-full bg-brand-light-teal px-3 py-1 text-xs font-bold text-brand-teal">
                  {offer.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <span>{offer.pymeCompanyName}</span>
                {offer.pymeVerified && (
                  <span className="flex items-center gap-1 text-brand-purple">
                    <ShieldCheck className="h-4 w-4" /> Empresa verificada
                  </span>
                )}
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {offer.description}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-brand-dark">
                  <DollarSign className="h-5 w-5 text-brand-teal shrink-0" />
                  <span>
                    {formattedMin && formattedMax
                      ? `${formattedMin} - ${formattedMax}`
                      : formattedBudget}
                    {" "}
                    <span className="font-normal text-slate-500">
                      {offer.budgetType === "HOURLY" ? "por hora" : "(presupuesto fijo)"}
                    </span>
                  </span>
                </div>

                {offer.duration && (
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-brand-dark">
                    <Calendar className="h-5 w-5 text-brand-teal shrink-0" />
                    <span>Duración: {offer.duration}</span>
                  </div>
                )}

                {offer.modality && ModalityIcon && (
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-brand-dark">
                    <ModalityIcon className="h-5 w-5 text-brand-teal shrink-0" />
                    <span>Modalidad: {MODALITY_LABELS[offer.modality] || offer.modality}</span>
                  </div>
                )}

                {offer.applicationDeadline && (
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-brand-dark">
                    <Clock className="h-5 w-5 text-brand-teal shrink-0" />
                    <span>Postula antes del {formatDate(offer.applicationDeadline)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <ListChecks className="h-4 w-4" /> Habilidades requeridas
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
              </div>

              {offer.createdAt && (
                <p className="text-xs text-slate-400">
                  Publicado el {formatDate(offer.createdAt)}
                </p>
              )}
            </CardContent>
          </Card>

          <SkillGapModal
            isOpen={showSkillGapModal}
            onClose={() => setShowSkillGapModal(false)}
            skillGap={skillGap}
          />
        </div>

        <div>
          <Card className="rounded-3xl border-slate-100 shadow-sm sticky top-24">
            <CardContent className="space-y-5 p-8">
              <h2 className="text-lg font-bold text-brand-dark">Enviar propuesta</h2>

              {success ? (
                <div className="flex items-center gap-2 rounded-2xl bg-brand-light-teal p-4 text-sm font-semibold text-brand-teal">
                  <CheckCircle2 className="h-4 w-4" />
                  ¡Tu propuesta fue enviada! Queda pendiente de revisión.
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {submitError && (
                    <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                      {submitError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500">Monto propuesto (USD)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      className="rounded-2xl border-slate-200 h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500">Días estimados</Label>
                    <Input
                      type="number"
                      min={1}
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="rounded-2xl border-slate-200 h-11"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl h-11 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold"
                  >
                    {submitting ? "Enviando..." : "Postular a esta oferta"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
